import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { checkIsAuthorizedUser } from '../lib/supabaseSync';
import { Lock, Mail, KeyRound, AlertCircle, CheckCircle, Database } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onSuccess: (userEmail: string) => void;
  onOpenSqlGuide: () => void;
  onSkipDemo: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onSuccess,
  onOpenSqlGuide,
  onSkipDemo,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isSupabaseConfigured || !supabase) {
      setErrorMsg('Supabase 환경 변수(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)가 설정되지 않았습니다. 아래의 [SQL 및 설정 가이드]를 확인하시거나 데모 모드로 진행해주세요.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        setSuccessMsg('회원가입이 완료되었습니다. 로그인해주세요.');
        setIsSignUp(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;

        const userEmail = data.user?.email || email;
        const authorized = await checkIsAuthorizedUser(userEmail);
        if (!authorized) {
          await supabase.auth.signOut();
          throw new Error('인가된 사용자(authorized_users) 목록에 등록되지 않은 이메일입니다.');
        }

        onSuccess(userEmail);
      }
    } catch (err: any) {
      setErrorMsg(err.message || '인증 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-6 text-white text-center">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3 backdrop-blur-xs">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">구매 견적 판정기 로그인</h2>
          <p className="text-xs text-indigo-100 mt-1">Supabase 인가 사용자 인증 시스템</p>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {!isSupabaseConfigured && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Supabase 미설정 상태 안내</span>
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                현재 `.env` 파일에 Supabase URL 및 Anon Key가 입력되지 않았습니다. 실시간 인증 및 DB 누적 저장을 사용하려면 Supabase 프로젝트를 연결하고 SQL을 실행해주세요.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={onOpenSqlGuide}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors text-[11px]"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>SQL 및 설정 가이드 보기</span>
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">이메일 주소</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">비밀번호</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? '처리 중...' : isSignUp ? '회원가입 요청' : '로그인 (인가 확인)'}
            </button>
          </form>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-600">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-indigo-600 hover:underline font-medium"
            >
              {isSignUp ? '이미 계정이 있으신가요? 로그인' : '인가된 계정 회원가입'}
            </button>

            <button
              type="button"
              onClick={onSkipDemo}
              className="text-slate-500 hover:text-slate-800 font-medium underline"
            >
              데모 모드(로컬)로 시작
            </button>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenSqlGuide}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <Database className="w-4 h-4 text-slate-500" />
              <span>Supabase SQL 스키마 및 설정 보기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
