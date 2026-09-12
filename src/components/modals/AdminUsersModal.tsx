import React, { useState, useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';

interface AdminUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminUsersModal: React.FC<AdminUsersModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.adminListUsers();
      if (res.users) setUsers(res.users);
    } catch (e: any) {
      onShowToast(`កំហុស: ${e.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) loadUsers();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSetPremium = async (userId: number) => {
    try {
      await api.adminSetPremium(userId, 30);
      onShowToast('បានតម្លើង Premium (30 ថ្ងៃ) ជោគជ័យ!', 'success');
      loadUsers();
    } catch (e: any) {
      onShowToast(`កំហុស: ${e.message}`, 'error');
    }
  };

  const premiumCount = users.filter((u) => u.tier === 'premium').length;
  const freeCount = users.filter((u) => u.tier === 'free').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-white/[0.1] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-white/[0.08] flex items-center justify-between bg-[#0b0f19]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 font-ui">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ផ្ទាំងគ្រប់គ្រងអ្នកប្រើប្រាស់ (Admin Users Console)</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats */}
        <div className="p-5 border-b border-white/[0.06] grid grid-cols-3 gap-3">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
            <div className="text-[11px] text-slate-400">អ្នកប្រើប្រាស់សរុប</div>
            <div className="text-lg font-bold text-white font-ui">{users.length}</div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
            <div className="text-[11px] text-emerald-300">សមាជិក Premium</div>
            <div className="text-lg font-bold text-emerald-400 font-ui">{premiumCount}</div>
          </div>
          <div className="bg-slate-500/10 border border-slate-500/20 rounded-lg p-3">
            <div className="text-[11px] text-slate-400">សមាជិក Free</div>
            <div className="text-lg font-bold text-slate-200 font-ui">{freeCount}</div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                <th className="py-2 px-3">ID</th>
                <th className="py-2 px-3">Username</th>
                <th className="py-2 px-3">Role</th>
                <th className="py-2 px-3">Tier</th>
                <th className="py-2 px-3">ផុតកំណត់</th>
                <th className="py-2 px-3 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-400">#{u.id}</td>
                  <td className="py-2.5 px-3 font-medium text-white">{u.username}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-400">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        u.tier === 'premium'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-slate-500/15 text-slate-400'
                      }`}
                    >
                      {u.tier}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                    {u.premium_expires_at ? u.premium_expires_at.slice(0, 10) : 'គ្មាន'}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleSetPremium(u.id)}
                        className="px-2.5 py-1 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-[11px] font-semibold transition-colors"
                      >
                        Set Premium
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-white/[0.08] bg-[#0b0f19] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs transition-colors"
          >
            បិទ
          </button>
        </div>
      </div>
    </div>
  );
};
