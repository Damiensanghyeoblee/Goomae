import React from 'react';
import { FileSpreadsheet, Plus, Upload, RotateCcw, Download } from 'lucide-react';

interface HeaderProps {
  totalCount: number;
  onReset: () => void;
  onExportCsv: () => void;
  onOpenImport: () => void;
  onOpenAdd: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCount,
  onReset,
  onExportCsv,
  onOpenImport,
  onOpenAdd,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-sm">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                구매 견적 비교·납기 판정기
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                구매요청(PR)별 복수 공급사 견적 비교 및 이상치·납기·표기 상이 자동 판정 시스템 (총 {totalCount}건)
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={onOpenImport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>파일 반입 / 붙여넣기</span>
          </button>

          <button
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>CSV 내보내기</span>
          </button>

          <button
            onClick={onReset}
            title="기본 샘플 데이터로 초기화"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>초기화</span>
          </button>

          <button
            onClick={onOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>견적 단건 추가</span>
          </button>
        </div>
      </div>
    </header>
  );
};
