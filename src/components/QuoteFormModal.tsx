import React, { useState, useEffect } from 'react';
import { QuoteItem } from '../types';
import { X, Save, Trash2 } from 'lucide-react';

interface QuoteFormModalProps {
  isOpen: boolean;
  editingItem: QuoteItem | null;
  onClose: () => void;
  onSave: (item: QuoteItem) => void;
  onDelete?: (quoteId: string) => void;
  nextQuoteId: string;
}

export const QuoteFormModal: React.FC<QuoteFormModalProps> = ({
  isOpen,
  editingItem,
  onClose,
  onSave,
  onDelete,
  nextQuoteId,
}) => {
  const [formData, setFormData] = useState<QuoteItem>({
    quote_id: nextQuoteId,
    pr_no: 'PR-2026-999',
    item_code: 'IT-001',
    item_name: 'MTBE 수입품',
    supplier: '신규공급사',
    unit: 't',
    qty: 5,
    unit_price: 800000,
    currency: 'KRW',
    quote_date: '2026-09-07',
    required_date: '2026-09-30',
    promised_date: '2026-09-25',
    status: '견적',
    remark: '',
  });

  useEffect(() => {
    if (editingItem) {
      setFormData(editingItem);
    } else {
      setFormData({
        quote_id: nextQuoteId,
        pr_no: 'PR-2026-999',
        item_code: 'IT-001',
        item_name: 'MTBE 수입품',
        supplier: '신규공급사',
        unit: 't',
        qty: 5,
        unit_price: 800000,
        currency: 'KRW',
        quote_date: '2026-09-07',
        required_date: '2026-09-30',
        promised_date: '2026-09-25',
        status: '견적',
        remark: '',
      });
    }
  }, [editingItem, nextQuoteId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">
            {editingItem ? `견적 정보 수정 (${editingItem.quote_id})` : '신규 견적 단건 추가'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">견적 ID</label>
              <input
                type="text"
                required
                value={formData.quote_id}
                onChange={(e) => setFormData({ ...formData, quote_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-medium text-slate-800"
                readOnly={Boolean(editingItem)}
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">PR 번호 (그룹키)</label>
              <input
                type="text"
                required
                value={formData.pr_no}
                onChange={(e) => setFormData({ ...formData, pr_no: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">품목 코드</label>
              <input
                type="text"
                required
                value={formData.item_code}
                onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/25"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">품목명</label>
              <input
                type="text"
                required
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/25"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">공급사</label>
              <input
                type="text"
                required
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/25"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">수량 / 단위</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  required
                  min="0.01"
                  step="any"
                  value={formData.qty}
                  onChange={(e) => setFormData({ ...formData, qty: parseFloat(e.target.value) || 0 })}
                  className="w-2/3 px-3 py-2 border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  required
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-1/3 px-3 py-2 border border-slate-300 rounded-lg text-center"
                />
              </div>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">단가 (KRW, 공란가능)</label>
              <input
                type="number"
                value={formData.unit_price !== null ? formData.unit_price : ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unit_price: e.target.value === '' ? null : parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="미기재 시 공란"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">견적 접수일</label>
              <input
                type="date"
                required
                value={formData.quote_date}
                onChange={(e) => setFormData({ ...formData, quote_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">요청 부서 필요일</label>
              <input
                type="date"
                required
                value={formData.required_date}
                onChange={(e) => setFormData({ ...formData, required_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">공급사 약속 납기</label>
              <input
                type="date"
                value={formData.promised_date || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    promised_date: e.target.value === '' ? null : e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="공란 가능"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">상태</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as '견적' | '발주' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="견적">견적</option>
                <option value="발주">발주</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">비고</label>
              <input
                type="text"
                value={formData.remark || ''}
                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="특이사항 입력"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            {editingItem && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('정말 이 견적 항목을 삭제하시겠습니까?')) {
                    onDelete(editingItem.quote_id);
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>삭제</span>
              </button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                취소
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>저장</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
