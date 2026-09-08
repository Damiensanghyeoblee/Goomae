import React from 'react';
import { AlertTriangle, Clock, AlertCircle, FileQuestion, CheckCircle2 } from 'lucide-react';
import { CalculatedQuoteItem, FilterState } from '../types';

interface SummaryCardsProps {
  items: CalculatedQuoteItem[];
  filter: FilterState;
  onFilterChange: (updater: Partial<FilterState>) => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  items,
  filter,
  onFilterChange,
}) => {
  // Compute counts
  const delayedCount = items.filter((i) => i.status === '발주' && i.deliveryState === '지연').length;
  const imminentCount = items.filter((i) => i.status === '발주' && i.deliveryState === '임박').length;
  const outlierCount = items.filter((i) => i.priceState === '이상치').length;
  
  const discrepantCodes = new Set(
    items.filter((i) => i.isNameDiscrepant).map((i) => i.item_code)
  );
  const discrepancyItemCount = discrepantCodes.size;

  const missingPriceCount = items.filter((i) => i.unit_price === null).length;
  const missingDeliveryCount = items.filter((i) => i.status === '발주' && !i.promised_date).length;
  const totalMissing = missingPriceCount + missingDeliveryCount;

  const isDelayedActive = filter.deliveryState === '지연' && filter.status === '발주';
  const isImminentActive = filter.deliveryState === '임박' && filter.status === '발주';
  const isOutlierActive = filter.priceState === '이상치';
  const isDiscrepancyActive = filter.discrepancyOnly;
  const isMissingActive = filter.missingOnly;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {/* 1. 지연 납기 */}
      <div
        onClick={() => {
          if (isDelayedActive) {
            onFilterChange({ deliveryState: '전체', status: '전체' });
          } else {
            onFilterChange({ deliveryState: '지연', status: '발주' });
          }
        }}
        className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-2xs hover:shadow-md ${
          isDelayedActive ? 'border-red-500 ring-2 ring-red-100 bg-red-50/30' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">납기 지연 (발주)</span>
          <div className="p-2 bg-red-100 text-red-700 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-red-600">{delayedCount}</span>
          <span className="text-xs text-slate-500">건</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">기준일(08-27) 이전 납기</p>
      </div>

      {/* 2. 납기 임박 */}
      <div
        onClick={() => {
          if (isImminentActive) {
            onFilterChange({ deliveryState: '전체', status: '전체' });
          } else {
            onFilterChange({ deliveryState: '임박', status: '발주' });
          }
        }}
        className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-2xs hover:shadow-md ${
          isImminentActive ? 'border-amber-500 ring-2 ring-amber-100 bg-amber-50/30' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">납기 임박 (발주)</span>
          <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-600">{imminentCount}</span>
          <span className="text-xs text-slate-500">건</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">D-DAY ~ D-7 이내</p>
      </div>

      {/* 3. 단가 이상치 */}
      <div
        onClick={() => {
          if (isOutlierActive) {
            onFilterChange({ priceState: '전체' });
          } else {
            onFilterChange({ priceState: '이상치' });
          }
        }}
        className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-2xs hover:shadow-md ${
          isOutlierActive ? 'border-rose-500 ring-2 ring-rose-100 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">단가 이상치</span>
          <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-rose-600">{outlierCount}</span>
          <span className="text-xs text-slate-500">건</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">중앙값 대비 ±30% 초과</p>
      </div>

      {/* 4. 품목명 표기 상이 */}
      <div
        onClick={() => {
          onFilterChange({ discrepancyOnly: !filter.discrepancyOnly });
        }}
        className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-2xs hover:shadow-md ${
          isDiscrepancyActive ? 'border-purple-500 ring-2 ring-purple-100 bg-purple-50/30' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">품목명 표기 상이</span>
          <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
            <FileQuestion className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-purple-600">{discrepancyItemCount}</span>
          <span className="text-xs text-slate-500">품목</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">동일 코드 내 명칭 흔들림</p>
      </div>

      {/* 5. 결측 / 미기재 */}
      <div
        onClick={() => {
          onFilterChange({ missingOnly: !filter.missingOnly });
        }}
        className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-2xs hover:shadow-md col-span-2 sm:col-span-1 ${
          isMissingActive ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">단가·납기 미기재</span>
          <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-700">{totalMissing}</span>
          <span className="text-xs text-slate-500">건</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">단가공란 {missingPriceCount} · 납기공란 {missingDeliveryCount}</p>
      </div>
    </div>
  );
};
