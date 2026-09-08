import React from 'react';
import { CalculatedQuoteItem } from '../types';
import { formatKRW } from '../utils';
import { AlertTriangle, Clock, AlertCircle, FileQuestion, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface QuoteTableProps {
  items: CalculatedQuoteItem[];
  isGroupedByPr: boolean;
  onSelectPr: (prNo: string) => void;
  onEditItem: (item: CalculatedQuoteItem) => void;
}

export const QuoteTable: React.FC<QuoteTableProps> = ({
  items,
  isGroupedByPr,
  onSelectPr,
  onEditItem,
}) => {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-2xs">
        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <FileQuestion className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">조회된 견적 데이터가 없습니다</h3>
        <p className="text-xs text-slate-500 mt-1">
          검색 조건을 변경하거나 새로운 견적 파일을 반입해주세요.
        </p>
      </div>
    );
  }

  // If grouped by PR
  if (isGroupedByPr) {
    const grouped: Record<string, CalculatedQuoteItem[]> = {};
    items.forEach((item) => {
      if (!grouped[item.pr_no]) {
        grouped[item.pr_no] = [];
      }
      grouped[item.pr_no].push(item);
    });

    return (
      <div className="space-y-6">
        {Object.entries(grouped).map(([prNo, groupItems]) => {
          const first = groupItems[0];
          const orderedItem = groupItems.find((i) => i.status === '발주');
          return (
            <div key={prNo} className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 text-sm">{prNo}</span>
                  <span className="text-xs text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                    {first.item_code} · {first.item_name}
                  </span>
                  <span className="text-xs text-slate-500">
                    수량: <strong className="text-slate-700">{first.qty} {first.unit}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectPr(prNo)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span>PR 비교 상세</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                      <th className="py-2.5 px-3">견적ID</th>
                      <th className="py-2.5 px-3">공급사</th>
                      <th className="py-2.5 px-3 text-right">단가 (KRW)</th>
                      <th className="py-2.5 px-3">단가판정</th>
                      <th className="py-2.5 px-3">상태</th>
                      <th className="py-2.5 px-3">약속납기</th>
                      <th className="py-2.5 px-3">납기판정</th>
                      <th className="py-2.5 px-3">비고</th>
                      <th className="py-2.5 px-3 text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {groupItems.map((item) => (
                      <tr key={item.quote_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-slate-800">{item.quote_id}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900 flex items-center gap-1.5">
                          {item.supplier}
                          {item.isLowestPrice && (
                            <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-2xs">
                              최저가
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                          {formatKRW(item.unit_price)}
                        </td>
                        <td className="py-2.5 px-3">
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
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold ${
                              item.status === '발주'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {item.promised_date || '-'}
                        </td>
                        <td className="py-2.5 px-3">
                          {item.status === '발주' ? (
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded font-bold ${
                                  item.deliveryState === '지연'
                                    ? 'bg-red-100 text-red-700 animate-pulse'
                                    : item.deliveryState === '임박'
                                    ? 'bg-amber-100 text-amber-800'
                                    : item.deliveryState === '정상'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {item.deliveryState} ({item.dDayText})
                              </span>
                              {item.isRequiredExceeded && (
                                <span title="필요일 초과" className="w-2 h-2 rounded-full bg-orange-500" />
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 truncate max-w-[150px]">
                          {item.remark || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => onEditItem(item)}
                            className="text-slate-500 hover:text-indigo-600 font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                          >
                            수정
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Flat Table View
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
              <th className="py-3 px-3">PR 번호</th>
              <th className="py-3 px-3">견적ID</th>
              <th className="py-3 px-3">품목명 / 코드</th>
              <th className="py-3 px-3">공급사</th>
              <th className="py-3 px-3 text-right">수량</th>
              <th className="py-3 px-3 text-right">단가 (KRW)</th>
              <th className="py-3 px-3">단가판정</th>
              <th className="py-3 px-3">상태</th>
              <th className="py-3 px-3">약속납기</th>
              <th className="py-3 px-3">납기판정</th>
              <th className="py-3 px-3">비고</th>
              <th className="py-3 px-3 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.quote_id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2.5 px-3 font-medium">
                  <button
                    onClick={() => onSelectPr(item.pr_no)}
                    className="text-indigo-600 hover:underline font-semibold"
                  >
                    {item.pr_no}
                  </button>
                </td>
                <td className="py-2.5 px-3 text-slate-700 font-medium">{item.quote_id}</td>
                <td className="py-2.5 px-3">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    {item.item_name}
                    {item.isNameDiscrepant && (
                      <span
                        title={`표기 상이 품목: ${item.discrepantNames?.join(', ')}`}
                        className="bg-purple-100 text-purple-700 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-purple-200"
                      >
                        표기상이
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">{item.item_code}</div>
                </td>
                <td className="py-2.5 px-3 font-medium text-slate-900">
                  <div className="flex items-center gap-1.5">
                    {item.supplier}
                    {item.isLowestPrice && (
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-2xs">
                        최저가
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-2.5 px-3 text-right text-slate-700">
                  {item.qty} {item.unit}
                </td>
                <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                  {formatKRW(item.unit_price)}
                </td>
                <td className="py-2.5 px-3">
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
                <td className="py-2.5 px-3">
                  <span
                    className={`px-2 py-0.5 rounded-full font-semibold ${
                      item.status === '발주'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  {item.promised_date || '-'}
                </td>
                <td className="py-2.5 px-3">
                  {item.status === '발주' ? (
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          item.deliveryState === '지연'
                            ? 'bg-red-100 text-red-700 animate-pulse'
                            : item.deliveryState === '임박'
                            ? 'bg-amber-100 text-amber-800'
                            : item.deliveryState === '정상'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.deliveryState} ({item.dDayText})
                      </span>
                      {item.isRequiredExceeded && (
                        <span title="필요일 초과" className="w-2 h-2 rounded-full bg-orange-500" />
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-slate-500 truncate max-w-[120px]">
                  {item.remark || '-'}
                </td>
                <td className="py-2.5 px-3 text-right">
                  <button
                    onClick={() => onEditItem(item)}
                    className="text-slate-500 hover:text-indigo-600 font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                  >
                    수정
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
