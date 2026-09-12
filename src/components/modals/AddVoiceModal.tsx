import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { api } from '../../services/api';

interface AddVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AddVoiceModal: React.FC<AddVoiceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onShowToast,
}) => {
  const [label, setLabel] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [gender, setGender] = useState('male');
  const [role, setRole] = useState('male_lead');
  const [words, setWords] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !label.trim()) {
      onShowToast('សូមបញ្ចូលឈ្មោះសំឡេង និងជ្រើសរើសឯកសារ!', 'error');
      return;
    }

    setIsLoading(true);
    const fd = new FormData();
    fd.append('audioFile', file);
    fd.append('label', label);
    fd.append('gender', gender);
    fd.append('role_key', role);
    fd.append('words', words);

    try {
      const res = await api.createCharacter(fd);
      if (res.success) {
        onShowToast('បានបង្កើតសំឡេងថ្មីជោគជ័យ!', 'success');
        onSuccess();
        onClose();
      }
    } catch (e: any) {
      onShowToast(`កំហុស: ${e.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-white/[0.1] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 px-6 border-b border-white/[0.08] flex items-center justify-between bg-[#0b0f19]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 font-ui">
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>បន្ថែមសំឡេងតួអង្គថ្មី (Add Character Voice)</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-xs">
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-300">ឈ្មោះសំឡេងថ្មី (Voice Name) *</label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="ឧ. 👑 តួឯកប្រុស រ៉ាជានី..."
              className="bg-[#07090e] border border-white/[0.08] rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-sky-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-300">ឯកសារសំឡេង ឬវីដេអូ (.mp3, .wav, .mp4) *</label>
            <input
              type="file"
              required
              accept="audio/*,video/*"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setFile(e.target.files[0]);
                }
              }}
              className="bg-[#07090e] border border-white/[0.08] rounded-lg px-3 py-2 text-slate-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400">សំឡេងពី ៣ ទៅ ១៥ វិនាទី ដែលនិយាយច្បាស់ មិនសូវមានភ្លេងកំដរ</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300">ភេទ (Gender)</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="bg-[#07090e] border border-white/[0.08] rounded-lg px-3 py-2 text-slate-200 outline-none"
              >
                <option value="male">👑 តួប្រុស (Male)</option>
                <option value="female">🌸 តួស្រី (Female)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300">តួនាទី (Role)</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-[#07090e] border border-white/[0.08] rounded-lg px-3 py-2 text-slate-200 outline-none"
              >
                <option value="male_lead">👑 តួឯកប្រុស</option>
                <option value="female_lead">🌸 តួឯកស្រី</option>
                <option value="general">🛡️ មេទ័ព</option>
                <option value="elder">📿 ព្រឹទ្ធាចារ្យ</option>
                <option value="villain">⚔️ តួកាច</option>
                <option value="other">🎭 ផ្សេងៗ</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-300">ឃ្លានិយាយគំរូ (Spoken Quote)</label>
            <textarea
              value={words}
              onChange={(e) => setWords(e.target.value)}
              placeholder="ឃ្លាដែលតួអង្គនិយាយក្នុងសំឡេងនេះ..."
              rows={2}
              className="bg-[#07090e] border border-white/[0.08] rounded-lg px-3 py-2 text-slate-200 outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs transition-colors"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-black font-semibold text-xs transition-colors shadow-md shadow-sky-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isLoading ? 'កំពុងបង្កើត...' : 'បង្កើត & រក្សាទុក'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
