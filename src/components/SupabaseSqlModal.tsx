import React, { useState } from 'react';
import { Database, Copy, Check, X, Terminal, ShieldCheck } from 'lucide-react';

interface SupabaseSqlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSqlModal: React.FC<SupabaseSqlModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlScript = `-- ==========================================
-- 1. 견적 데이터 저장 테이블 (quotes)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.quotes (
    quote_id VARCHAR(100) PRIMARY KEY,
    pr_no VARCHAR(100) NOT NULL,
    item_code VARCHAR(100) NOT NULL,
    item_name TEXT NOT NULL,
    supplier VARCHAR(200) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    qty NUMERIC NOT NULL,
    unit_price NUMERIC,
    currency VARCHAR(10) DEFAULT 'KRW',
    quote_date DATE NOT NULL,
    required_date DATE NOT NULL,
    promised_date DATE,
    status VARCHAR(50) DEFAULT '접수완료',
    remark TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. 인가된 사용자 테이블 (authorized_users)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.authorized_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'purchaser',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 예시 관리자/구매 담당자 이메일 등록 (실제 사용하는 이메일로 변경하세요)
INSERT INTO public.authorized_users (email, role)
VALUES 
    ('admin@company.com', 'admin'),
    ('purchaser1@company.com', 'purchaser')
ON CONFLICT (email) DO NOTHING;

-- ==========================================
-- 3. Row Level Security (RLS) 설정
-- ==========================================
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorized_users ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자에게 quotes 읽기/쓰기 권한 부여
CREATE POLICY "Enable all actions for authenticated users on quotes"
ON public.quotes
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 인증된 사용자에게 authorized_users 읽기 권한 부여
CREATE POLICY "Enable read for authenticated users on authorized_users"
ON public.authorized_users
FOR SELECT
TO authenticated
USING (true);
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-sm tracking-tight">Supabase DB 설정 및 SQL 스키마</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-2">
            <div className="font-bold text-indigo-900 flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>사용 방법 안내</span>
            </div>
            <p className="text-indigo-700 leading-relaxed text-[11px]">
              1. Supabase 대시보드(SQL Editor)에 접속하여 아래의 SQL 코드를 실행하여 <code className="bg-indigo-100 px-1 py-0.5 rounded font-mono">quotes</code>와 <code className="bg-indigo-100 px-1 py-0.5 rounded font-mono">authorized_users</code> 테이블을 생성하세요.<br />
              2. <code className="bg-indigo-100 px-1 py-0.5 rounded font-mono">authorized_users</code> 테이블에 로그인할 관리자/구매담당자 이메일을 미리 등록해주세요.<br />
              3. 프로젝트의 <code className="bg-indigo-100 px-1 py-0.5 rounded font-mono">.env</code> 파일에 <code className="bg-indigo-100 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_URL</code>과 <code className="bg-indigo-100 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_ANON_KEY</code>를 입력해주세요.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-slate-500" />
                <span>Supabase SQL 쿼리문</span>
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors text-[11px]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '복사완료!' : 'SQL 복사하기'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-950 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800 max-h-72">
              {sqlScript}
            </pre>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
