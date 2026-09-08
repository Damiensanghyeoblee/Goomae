import React, { useState } from 'react';
import { CalculatedQuoteItem } from '../types';
import { formatKRW } from '../utils';
import { X, Copy, Check, AlertCircle } from 'lucide-react';

interface PRComparisonModalProps {
  prNo: string | null;
  items: CalculatedQuoteItem[];
  onClose: () => void;
  onUpdateStatus: (quoteId: string, newStatus: '견적' | '발주') => void;
}

export const PRComparisonModal: React.FC<PRComparisonModalProps> = ({
  prNo,
  items,
  onClose,
  onUpdateStatus,
}) => {
  const [copied, setCopied] = useState(false);

  if (!prNo) return null;

  const prItems = items.filter((i) => i.pr_no === prNo);
  if (prItems.length === 0) return null;

  const first = prItems[0];
  const lowestItem = prItems.find((i) => i.isLowestPrice);
  const orderedItem = prItems.find((i) => i.status === '발주');

  const handleCopyClipboard = () => {
    const header = ['견적ID', '공급사', '단가(KRW)', '단가판정', '상태', '약속납기', '납기판정', '비고'].join('\t');
    const rows = prItems.map((i) =>
      [
        i.quote_id,
        i.supplier,
        i.unit_price !== null ? i.unit_price : '미기재',
        i.priceState,
        i.status,
        i.promised_date || '-',
        i.status === '발주' ? `${i.deliveryState} (${i.dDayText})` : '-',
        i.remark || '-',
      ].join('\t')
    );
    const text = [`[PR 비교표] ${prNo} - ${first.item_name} (${first.qty} ${first.unit})`, header, ...rows].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{prNo} 견적 비교 상세</h2>
              <span className="text-xs bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded">
                {first.item_code} · {first.item_name}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              요청수량: <strong className="text-slate-700">{first.qty} {first.unit}</strong> | 필요일: {first.required_date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Highlight Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-xs">
            <div>
              <span className="text-slate-500 block font-medium">최저가 추천 공급사</span>
              <span className="text-sm font-bold text-indigo-700 mt-0.5 block">
                {lowestItem ? `${lowestItem.supplier} (${formatKRW(lowestItem.unit_price)})` : '해당 없음'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">현재 발주 상태</span>
              <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                {orderedItem ? `${orderedItem.supplier} (${formatKRW(orderedItem.unit_price)}) - ${orderedItem.deliveryState}` : '발주 미지정'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">단가 중앙값 (MED)</span>
              <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                {first.medianPrice !== null ? formatKRW(first.medianPrice) : '비교 불가 (<3건)'}
              </span>
            </div>
          </div>

          {/* Supplier Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800">공급사별 견적 및 납기 비교</h3>
              <button
                onClick={handleCopyClipboard}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                <span>{copied ? '복사 완료!' : '비교표 텍스트 복사'}</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">견적ID</th>
                    <th className="py-3 px-4">공급사</th>
                    <th className="py-3 px-4 text-right">단가 (KRW)</th>
                    <th className="py-3 px-4">단가판정 (중앙값±30%)</th>
                    <th className="py-3 px-4">상태</th>
                    <th className="py-3 px-4">약속납기</th>
                    <th className="py-3 px-4">납기판정</th>
                    <th className="py-3 px-4 text-right">전환</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prItems.map((item) => (
                    <tr key={item.quote_id} className={`hover:bg-slate-50 transition-colors ${item.status === '발주' ? 'bg-indigo-50/20' : ''}`}>
                      <td className="py-3 px-4 font-medium text-slate-800">{item.quote_id}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          {item.supplier}
                          {item.isLowestPrice && (
                            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                              최저가
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatKRW(item.unit_price)}
                      </td>
                      <td className="py-3 px-4">
                        {item.priceState === '이상치' ? (
                          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-medium">
                            <AlertCircle className="w-3 h-3" />
                            이상치 ({item.priceDeviation !== null && item.priceDeviation > 0 ? `+${item.priceDeviation}%` : `${item.priceDeviation}%`})
                          </span>
                        ) : item.priceState === '단가 미기재' ? (
                          <span className="text-slate-400 font-medium">미기재</span>
                        ) : (
                          <span className="text-slate-600">정상</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold ${
                            item.status === '발주'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{item.promised_date || '-'}</td>
                      <td className="py-3 px-4">
                        {item.status === '발주' ? (
                          <span
                            className={`px-2.5 py-1 rounded font-bold ${
                              item.deliveryState === '지연'
                                ? 'bg-red-100 text-red-700'
                                : item.deliveryState === '임박'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {item.deliveryState} ({item.dDayText})
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            const newStatus = item.status === '발주' ? '견적' : '발주';
                            onUpdateStatus(item.quote_id, newStatus);
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            item.status === '발주'
                              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {item.status === '발주' ? '견적으로 변경' : '발주로 지정'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
