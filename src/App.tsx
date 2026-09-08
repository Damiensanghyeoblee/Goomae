import React, { useState, useEffect, useMemo } from 'react';
import { QuoteItem, FilterState, CalculatedQuoteItem } from './types';
import { INITIAL_QUOTES } from './data';
import { calculateQuotes } from './utils';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { FilterBar } from './components/FilterBar';
import { QuoteTable } from './components/QuoteTable';
import { PRComparisonModal } from './components/PRComparisonModal';
import { QuoteFormModal } from './components/QuoteFormModal';
import { ImportModal } from './components/ImportModal';
import { LoginModal } from './components/LoginModal';
import { SupabaseSqlModal } from './components/SupabaseSqlModal';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { fetchQuotesFromSupabase, upsertQuotesToSupabase, deleteQuoteFromSupabase } from './lib/supabaseSync';

const STORAGE_KEY = 'exs02.quotes.v1';
const USER_KEY = 'exs02.user.v1';

export default function App() {
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem(USER_KEY) || (isSupabaseConfigured ? null : 'demo-user@company.com');
  });
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);

  const [quotes, setQuotes] = useState<QuoteItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load quotes from localStorage', e);
    }
    return INITIAL_QUOTES;
  });

  const [filter, setFilter] = useState<FilterState>({
    search: '',
    status: '전체',
    deliveryState: '전체',
    priceState: '전체',
    discrepancyOnly: false,
    missingOnly: false,
    selectedPr: null,
  });

  const [isGroupedByPr, setIsGroupedByPr] = useState(false);
  const [activeModalPr, setActiveModalPr] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QuoteItem | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Check Supabase session on mount
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email) {
          setUserEmail(session.user.email);
          localStorage.setItem(USER_KEY, session.user.email);
        } else if (!userEmail) {
          setIsLoginOpen(true);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user?.email) {
          setUserEmail(session.user.email);
          localStorage.setItem(USER_KEY, session.user.email);
          setIsLoginOpen(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else if (!userEmail) {
      setIsLoginOpen(true);
    }
  }, []);

  // Fetch data from Supabase when user is authenticated and configured
  useEffect(() => {
    if (isSupabaseConfigured && userEmail) {
      fetchQuotesFromSupabase().then((remoteQuotes) => {
        if (remoteQuotes && remoteQuotes.length > 0) {
          setQuotes(remoteQuotes);
        } else {
          // If remote is empty, seed with initial or local quotes
          upsertQuotesToSupabase(quotes);
        }
      });
    }
  }, [userEmail]);

  // Save to localStorage and sync to Supabase
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
    } catch (e) {
      console.error('Failed to save quotes to localStorage', e);
    }

    if (isSupabaseConfigured && userEmail) {
      upsertQuotesToSupabase(quotes);
    }
  }, [quotes, userEmail]);

  // Calculate items
  const calculatedItems = useMemo(() => {
    return calculateQuotes(quotes);
  }, [quotes]);

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return calculatedItems.filter((item) => {
      // Search term
      if (filter.search.trim()) {
        const q = filter.search.toLowerCase();
        const match =
          item.pr_no.toLowerCase().includes(q) ||
          item.quote_id.toLowerCase().includes(q) ||
          item.item_code.toLowerCase().includes(q) ||
          item.item_name.toLowerCase().includes(q) ||
          item.supplier.toLowerCase().includes(q) ||
          (item.remark && item.remark.toLowerCase().includes(q));
        if (!match) return false;
      }

      // Status
      if (filter.status !== '전체' && item.status !== filter.status) {
        return false;
      }

      // Delivery State
      if (filter.deliveryState !== '전체') {
        if (item.status !== '발주' || item.deliveryState !== filter.deliveryState) {
          return false;
        }
      }

      // Price State
      if (filter.priceState !== '전체' && item.priceState !== filter.priceState) {
        return false;
      }

      // Discrepancy only
      if (filter.discrepancyOnly && !item.isNameDiscrepant) {
        return false;
      }

      // Missing only
      if (filter.missingOnly) {
        const isMissingPrice = item.unit_price === null;
        const isMissingDelivery = item.status === '발주' && !item.promised_date;
        if (!isMissingPrice && !isMissingDelivery) return false;
      }

      // Selected PR
      if (filter.selectedPr && item.pr_no !== filter.selectedPr) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const getRank = (item: CalculatedQuoteItem) => {
        if (item.status !== '발주') return 4;
        if (item.deliveryState === '지연') return 0;
        if (item.deliveryState === '임박') return 1;
        if (item.deliveryState === '정상') return 2;
        return 3;
      };

      const rankA = getRank(a);
      const rankB = getRank(b);
      if (rankA !== rankB) return rankA - rankB;

      const daysA = a.dDays !== null ? a.dDays : 9999;
      const daysB = b.dDays !== null ? b.dDays : 9999;
      if (daysA !== daysB) return daysA - daysB;

      if (a.pr_no !== b.pr_no) return a.pr_no.localeCompare(b.pr_no);

      const priceA = a.unit_price !== null ? a.unit_price : 999999999;
      const priceB = b.unit_price !== null ? b.unit_price : 999999999;
      return priceA - priceB;
    });
  }, [calculatedItems, filter]);

  const handleReset = () => {
    if (confirm('모든 데이터를 기본 샘플 견적(80건)으로 초기화하시겠습니까?')) {
      setQuotes(INITIAL_QUOTES);
      setFilter({
        search: '',
        status: '전체',
        deliveryState: '전체',
        priceState: '전체',
        discrepancyOnly: false,
        missingOnly: false,
        selectedPr: null,
      });
      if (isSupabaseConfigured) {
        upsertQuotesToSupabase(INITIAL_QUOTES);
      }
    }
  };

  const handleExportCsv = () => {
    const headers = ['quote_id', 'pr_no', 'item_code', 'item_name', 'supplier', 'unit', 'qty', 'unit_price', 'currency', 'quote_date', 'required_date', 'promised_date', 'status', 'remark'];
    const rows = quotes.map((q) => [
      q.quote_id,
      q.pr_no,
      q.item_code,
      `"${q.item_name}"`,
      `"${q.supplier}"`,
      q.unit,
      q.qty,
      q.unit_price !== null ? q.unit_price : '',
      q.currency,
      q.quote_date,
      q.required_date,
      q.promised_date || '',
      q.status,
      `"${q.remark || ''}"`,
    ].join(','));

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `purchase_quotes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveQuote = (newItem: QuoteItem) => {
    setQuotes((prev) => {
      const exists = prev.some((q) => q.quote_id === newItem.quote_id);
      if (exists) {
        return prev.map((q) => (q.quote_id === newItem.quote_id ? newItem : q));
      } else {
        return [newItem, ...prev];
      }
    });
  };

  const handleDeleteQuote = (quoteId: string) => {
    setQuotes((prev) => prev.filter((q) => q.quote_id !== quoteId));
    if (isSupabaseConfigured) {
      deleteQuoteFromSupabase(quoteId);
    }
  };

  const handleUpdateStatus = (quoteId: string, newStatus: '견적' | '발주') => {
    setQuotes((prev) =>
      prev.map((q) => (q.quote_id === quoteId ? { ...q, status: newStatus } : q))
    );
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUserEmail(null);
    localStorage.removeItem(USER_KEY);
    setIsLoginOpen(true);
  };

  const nextQuoteId = useMemo(() => {
    const maxNum = quotes.reduce((max, q) => {
      const match = q.quote_id.match(/QT-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    return `QT-${String(maxNum + 1).padStart(3, '0')}`;
  }, [quotes]);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased">
      <Header
        totalCount={quotes.length}
        userEmail={userEmail}
        onReset={handleReset}
        onExportCsv={handleExportCsv}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenAdd={() => {
          setEditingItem(null);
          setIsFormOpen(true);
        }}
        onLogout={handleLogout}
        onOpenSqlGuide={() => setIsSqlModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SummaryCards
          items={calculatedItems}
          filter={filter}
          onFilterChange={(updater) => setFilter((prev) => ({ ...prev, ...updater }))}
        />

        <FilterBar
          filter={filter}
          onFilterChange={(updater) => setFilter((prev) => ({ ...prev, ...updater }))}
          isGroupedByPr={isGroupedByPr}
          onToggleGroupedByPr={() => setIsGroupedByPr(!isGroupedByPr)}
          onResetFilter={() =>
            setFilter({
              search: '',
              status: '전체',
              deliveryState: '전체',
              priceState: '전체',
              discrepancyOnly: false,
              missingOnly: false,
              selectedPr: null,
            })
          }
          resultCount={filteredItems.length}
        />

        <QuoteTable
          items={filteredItems}
          isGroupedByPr={isGroupedByPr}
          onSelectPr={(prNo) => setActiveModalPr(prNo)}
          onEditItem={(item) => {
            setEditingItem(item);
            setIsFormOpen(true);
          }}
        />
      </main>

      <PRComparisonModal
        prNo={activeModalPr}
        items={calculatedItems}
        onClose={() => setActiveModalPr(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      <QuoteFormModal
        isOpen={isFormOpen}
        editingItem={editingItem}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveQuote}
        onDelete={handleDeleteQuote}
        nextQuoteId={nextQuoteId}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportData={(imported) => {
          // Accumulate CSV data with existing or replace according to import choice
          setQuotes(imported);
          if (isSupabaseConfigured) {
            upsertQuotesToSupabase(imported);
          }
        }}
      />

      <LoginModal
        isOpen={isLoginOpen && !userEmail}
        onSuccess={(email) => {
          setUserEmail(email);
          localStorage.setItem(USER_KEY, email);
          setIsLoginOpen(false);
        }}
        onOpenSqlGuide={() => setIsSqlModalOpen(true)}
        onSkipDemo={() => {
          setUserEmail('demo-user@company.com');
          localStorage.setItem(USER_KEY, 'demo-user@company.com');
          setIsLoginOpen(false);
        }}
      />

      <SupabaseSqlModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
      />
    </div>
  );
}
