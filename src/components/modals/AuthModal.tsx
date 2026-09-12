import React, { useState } from 'react';
import { Sparkles, User as UserIcon, Lock, LogIn } from 'lucide-react';
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
        onShowToast(`ស្វាគមន៍ ${res.user.username}!`, 'success');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'កំហុសគណនី ឬពាក្យសម្ងាត់');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-white/[0.1] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 text-center flex flex-col items-center gap-2 border-b border-white/[0.06] bg-[#0b0f19]">
          <div className="relative mb-1">
            <img
              src="/logo.png"
              alt="អាទិទេព DABBER PRO"
              className="w-14 h-14 rounded-2xl border-2 border-sky-400/50 shadow-[0_0_20px_rgba(56,189,248,0.5)] object-cover"
            />
          </div>
          <h2 className="text-base font-bold text-white font-ui">អាទិទេព DABBER PRO</h2>
          <p className="text-xs text-slate-400">
            ចូលប្រើប្រាស់ប្រព័ន្ធស្ទូឌីយោ AI Dubbing
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/[0.06] bg-[#07090e]">
          <button
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-xs font-semibold transition-all ${
              mode === 'login'
                ? 'border-b-2 border-sky-400 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ចូលគណនី (Login)
          </button>
          <button
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-xs font-semibold transition-all ${
              mode === 'register'
                ? 'border-b-2 border-sky-400 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            បង្កើតគណនី (Register)
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-sky-400" />
              <span>ឈ្មោះគណនី ឬ Email</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="cm5722254@gmail.com"
              className="bg-[#07090e] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-sky-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>ពាក្យសម្ងាត់ (Password)</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-[#07090e] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-sky-400"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full py-2.5 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 hover:brightness-110 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 active:scale-95 transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'កំពុងដំណើរការ...' : mode === 'login' ? 'ចូលប្រើប្រាស់' : 'បង្កើតគណនី'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
