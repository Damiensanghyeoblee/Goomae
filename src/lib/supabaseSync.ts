import { supabase, isSupabaseConfigured } from './supabase';
import { QuoteItem } from '../types';

export async function fetchQuotesFromSupabase(): Promise<QuoteItem[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('quote_id', { ascending: true });

    if (error) {
      console.error('Error fetching quotes from Supabase:', error);
      return null;
    }

    if (data && data.length > 0) {
      return data.map((row: any) => ({
        quote_id: row.quote_id,
        pr_no: row.pr_no,
        item_code: row.item_code,
        item_name: row.item_name,
        supplier: row.supplier,
        unit: row.unit,
        qty: Number(row.qty),
        unit_price: row.unit_price !== null && row.unit_price !== undefined ? Number(row.unit_price) : null,
        currency: row.currency || 'KRW',
        quote_date: row.quote_date,
        required_date: row.required_date,
        promised_date: row.promised_date || null,
        status: row.status,
        remark: row.remark || '',
      }));
    }
    return null;
  } catch (err) {
    console.error('Supabase fetch exception:', err);
    return null;
  }
}

export async function upsertQuotesToSupabase(quotes: QuoteItem[]): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    // Upsert quotes (accumulate / update)
    const payload = quotes.map((q) => ({
      quote_id: q.quote_id,
      pr_no: q.pr_no,
      item_code: q.item_code,
      item_name: q.item_name,
      supplier: q.supplier,
      unit: q.unit,
      qty: q.qty,
      unit_price: q.unit_price,
      currency: q.currency || 'KRW',
      quote_date: q.quote_date,
      required_date: q.required_date,
      promised_date: q.promised_date,
      status: q.status,
      remark: q.remark,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('quotes')
      .upsert(payload, { onConflict: 'quote_id' });

    if (error) {
      console.error('Error upserting quotes to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase upsert exception:', err);
    return false;
  }
}

export async function deleteQuoteFromSupabase(quoteId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('quote_id', quoteId);

    if (error) {
      console.error('Error deleting quote from Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase delete exception:', err);
    return false;
  }
}

export async function checkIsAuthorizedUser(email: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return true; // If not configured, allow demo

  try {
    const { data, error } = await supabase
      .from('authorized_users')
      .select('email')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (error || !data) {
      // Also check if authorized_users table doesn't exist yet, fallback to true or allow
      return true; 
    }
    return Boolean(data);
  } catch (e) {
    return true;
  }
}
