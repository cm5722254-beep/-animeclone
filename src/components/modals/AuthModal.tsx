import React, { useState } from 'react';
import { Film, User as UserIcon, Lock, LogIn, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (user: User) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onSuccess,
  onShowToast,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const fn = mode === 'login' ? api.login : api.register;
      const res = await fn({ username, password });
      if (res.token) {
        localStorage.setItem('studio_auth_token', res.token);
        onSuccess(res.user);
        onShowToast(`Welcome back, ${res.user.username}!`, 'success');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Account or password incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueGuest = () => {
    const guestUser: User = {
      id: 1,
      username: 'Studio Operator',
      role: 'admin',
      tier: 'premium',
    };
    onSuccess(guestUser);
    onShowToast('Entered studio as Studio Operator', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#0e111a] border border-white/[0.1] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 text-center flex flex-col items-center gap-2 border-b border-white/[0.08] bg-[#090b12]">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25 border border-sky-400/30 mb-1">
            <Film className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-bold text-white font-ui tracking-wide">CHEATZ DABBER</h2>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30">
              v3 PRO
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Professional AI Dubbing Studio
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/[0.08] bg-[#07090e]">
          <button
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 text-xs font-semibold transition-all ${
              mode === 'login'
                ? 'border-b-2 border-sky-400 text-white bg-white/[0.02]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Login / ចូលគណនី
          </button>
          <button
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 text-xs font-semibold transition-all ${
              mode === 'register'
                ? 'border-b-2 border-sky-400 text-white bg-white/[0.02]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register / បង្កើតគណនី
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3.5">
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-sky-400" />
              <span>Username / Email</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username or email"
              className="bg-[#07090e] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-sky-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Password</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-[#07090e] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-sky-400"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-110 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 active:scale-95 transition-all disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'Connecting...' : mode === 'login' ? 'Sign In to Studio' : 'Create Account'}</span>
          </button>

          <div className="flex items-center gap-2 my-1">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] text-slate-500 font-mono">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            type="button"
            onClick={handleContinueGuest}
            className="w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Continue as Studio Operator (Quick Access)</span>
            <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
          </button>
        </form>
      </div>
    </div>
  );
};
