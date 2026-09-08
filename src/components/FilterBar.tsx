import React from 'react';
import { Search, X, Layers, List } from 'lucide-react';
import { FilterState } from '../types';

interface FilterBarProps {
  filter: FilterState;
  onFilterChange: (updater: Partial<FilterState>) => void;
  isGroupedByPr: boolean;
  onToggleGroupedByPr: () => void;
  onResetFilter: () => void;
  resultCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  isGroupedByPr,
  onToggleGroupedByPr,
  onResetFilter,
  resultCount,
}) => {
  const hasActiveFilter =
    filter.search !== '' ||
    filter.status !== '전체' ||
    filter.deliveryState !== '전체' ||
    filter.priceState !== '전체' ||
    filter.discrepancyOnly ||
    filter.missingOnly ||
    filter.selectedPr !== null;

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-2xs space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="PR 번호, 견적 ID, 품목코드, 품목명, 공급사 검색..."
            value={filter.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400"
          />
          {filter.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View mode toggle & reset */}
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={onToggleGroupedByPr}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors ${
              isGroupedByPr
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isGroupedByPr ? <Layers className="w-4 h-4 text-indigo-600" /> : <List className="w-4 h-4 text-slate-500" />}
            <span>PR별 그룹 보기</span>
          </button>

          {hasActiveFilter && (
            <button
              onClick={onResetFilter}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>필터 초기화</span>
            </button>
          )}

          <div className="text-xs font-medium text-slate-500 pl-2 border-l border-slate-200">
            조회 <span className="font-bold text-indigo-600">{resultCount}</span>건
          </div>
        </div>
      </div>

      {/* Filter selectors */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
        {/* Status filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200">
          <span className="text-slate-500 font-medium px-1.5">상태:</span>
          {(['전체', '견적', '발주'] as const).map((st) => (
            <button
              key={st}
              onClick={() => onFilterChange({ status: st })}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                filter.status === st
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Delivery State Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200">
          <span className="text-slate-500 font-medium px-1.5">납기:</span>
          {(['전체', '지연', '임박', '정상', '납기 미기재'] as const).map((ds) => (
            <button
              key={ds}
              onClick={() => onFilterChange({ deliveryState: ds })}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                filter.deliveryState === ds
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {ds}
            </button>
          ))}
        </div>

        {/* Price State Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200">
          <span className="text-slate-500 font-medium px-1.5">단가:</span>
          {(['전체', '정상', '이상치'] as const).map((ps) => (
            <button
              key={ps}
              onClick={() => onFilterChange({ priceState: ps })}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                filter.priceState === ps
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {ps}
            </button>
          ))}
        </div>

        {filter.selectedPr && (
          <div className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-200 font-medium">
            <span>PR: {filter.selectedPr}</span>
            <button
              onClick={() => onFilterChange({ selectedPr: null })}
              className="hover:text-indigo-900"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
