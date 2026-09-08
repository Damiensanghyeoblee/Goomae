import React, { useState } from 'react';
import { QuoteItem } from '../types';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportData: (items: QuoteItem[]) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImportData }) => {
  const [pasteText, setPasteText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // CSV parser helper
  const parseCSV = (csvText: string): QuoteItem[] => {
    const lines = csvText.split(/\r\n|\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length < 2) {
      throw new Error('CSV 데이터에 헤더 및 데이터 행이 충분하지 않습니다.');
    }

    const headerLine = lines[0];
    const delimiter = headerLine.includes('\t') ? '\t' : ',';
    const headers = headerLine.split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ''));

    const requiredHeaders = ['quote_id', 'pr_no', 'item_code', 'item_name', 'supplier', 'unit', 'qty'];
    for (const req of requiredHeaders) {
      if (!headers.includes(req)) {
        throw new Error(`필수 컬럼 "${req}"이(가) 누락되었습니다.`);
      }
    }

    const items: QuoteItem[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      // Simple CSV split (handling basic quotes if needed or comma split)
      const values = line.split(delimiter).map((v) => v.trim().replace(/^"|"$/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });

      if (!row.quote_id || !row.pr_no) continue;

      items.push({
        quote_id: row.quote_id,
        pr_no: row.pr_no,
        item_code: row.item_code,
        item_name: row.item_name,
        supplier: row.supplier,
        unit: row.unit || 'EA',
        qty: parseFloat(row.qty) || 1,
        unit_price: row.unit_price && row.unit_price !== '' && !isNaN(Number(row.unit_price)) ? Number(row.unit_price) : null,
        currency: row.currency || 'KRW',
        quote_date: row.quote_date || '2026-08-01',
        required_date: row.required_date || '2026-09-01',
        promised_date: row.promised_date && row.promised_date !== '' ? row.promised_date : null,
        status: row.status === '발주' ? '발주' : '견적',
        remark: row.remark || '',
      });
    }

    return items;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          throw new Error('가져올 수 있는 데이터 행이 없습니다.');
        }
        onImportData(parsed);
        setErrorMsg(null);
        onClose();
      } catch (err: any) {
        setErrorMsg(err.message || 'CSV 파싱 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handlePasteSubmit = () => {
    try {
      if (!pasteText.trim()) {
        throw new Error('붙여넣을 텍스트가 없습니다.');
      }
      const parsed = parseCSV(pasteText);
      if (parsed.length === 0) {
        throw new Error('가져올 수 있는 데이터 행이 없습니다.');
      }
      onImportData(parsed);
      setErrorMsg(null);
      setPasteText('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || '텍스트 파싱 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">견적 데이터 파일 반입</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. File Upload */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-800">CSV 파일 업로드</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors bg-slate-50/50">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-600 font-medium mb-1">
                ERP 내보내기 CSV 파일(예: ds02_purchase_quotes.csv)을 선택하세요
              </p>
              <p className="text-[11px] text-slate-400 mb-3">UTF-8 인코딩, 첫 행 헤더 포함</p>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
            </div>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-[11px]">또는 텍스트 직접 붙여넣기</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* 2. Text Paste */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-800">CSV / 탭 구분 텍스트 붙여넣기</label>
            <textarea
              rows={6}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="quote_id,pr_no,item_code,item_name,supplier,unit,qty,unit_price,currency,quote_date,required_date,promised_date,status,remark&#10;QT-001,PR-2026-001,IT-001,MTBE 수입품,유진테크,t,5,,KRW,2026-08-05,2026-09-07,2026-08-29,견적,"
              className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500"
            />
            <div className="flex justify-end">
              <button
                onClick={handlePasteSubmit}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm"
              >
                <FileText className="w-4 h-4" />
                <span>붙여넣기 데이터 반입</span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
