import React, { useState } from 'react';
import { PlusCircle, Search, Volume2, Edit3, Sparkles } from 'lucide-react';
import { CharacterVoice } from '../../types';

interface CharacterLibraryProps {
  characters: CharacterVoice[];
  onOpenAddModal: () => void;
  onOpenEditModal: (char: CharacterVoice) => void;
  onOpenAuditionModal: (char: CharacterVoice) => void;
}

export const CharacterLibrary: React.FC<CharacterLibraryProps> = ({
  characters = [],
  onOpenAddModal,
  onOpenEditModal,
  onOpenAuditionModal,
}) => {
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');

  const filtered = characters.filter((c) => {
    const matchSearch =
      (c.label || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.words || '').toLowerCase().includes(search.toLowerCase());
    const matchGender = genderFilter === 'all' || c.gender === genderFilter;
    return matchSearch && matchGender;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-6 select-none">
      {/* Top Action Toolbar */}
      <div className="bg-[#111827] border border-white/[0.08] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white font-ui">
            គ្រប់គ្រងសំឡេងតួអង្គខ្មែរ (Character Voice Management)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            សំឡេងតួឯកប្រុស តួឯកស្រី មេទ័ព ព្រឹទ្ធាចារ្យ តួកាច និងការ Clone សំឡេងផ្ទាល់ខ្លួន
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-semibold text-xs transition-colors self-start sm:self-auto shrink-0 shadow-md shadow-sky-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ បន្ថែមសំឡេងថ្មី</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ស្វែងរកឈ្មោះតួអង្គ ឬឃ្លានិយាយ..."
            className="w-full bg-[#0b0f19] border border-white/[0.08] rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-sky-400 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setGenderFilter('all')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
              genderFilter === 'all'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'bg-white/[0.04] text-slate-400 hover:text-white'
            }`}
          >
            ទាំងអស់ ({characters.length})
          </button>
          <button
            onClick={() => setGenderFilter('male')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
              genderFilter === 'male'
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-white/[0.04] text-slate-400 hover:text-white'
            }`}
          >
            តួប្រុស
          </button>
          <button
            onClick={() => setGenderFilter('female')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
              genderFilter === 'female'
                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                : 'bg-white/[0.04] text-slate-400 hover:text-white'
            }`}
          >
            តួស្រី
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((char) => (
          <div
            key={char.id}
            className="bg-[#111827] border border-white/[0.08] hover:border-sky-500/30 rounded-xl p-4 flex flex-col justify-between gap-3 transition-all hover:shadow-lg hover:shadow-sky-950/20"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-white">{char.label || char.filename}</h4>
                  <span
                    className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded mt-1 ${
                      char.gender === 'female'
                        ? 'bg-pink-500/15 text-pink-300 border border-pink-500/20'
                        : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                    }`}
                  >
                    {char.role_key || 'តួអង្គ'} • {char.gender === 'female' ? 'ស្រី' : 'ប្រុស'}
                  </span>
                </div>

                <button
                  onClick={() => onOpenAuditionModal(char)}
                  className="p-1.5 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 transition-colors"
                  title="សាកល្បងឱ្យតួអង្គនិយាយ (Audition)"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-black/20 p-2 rounded">
                "{char.words || 'សំឡេងគំរូក្នុងស្ទូឌីយោ'}"
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] mt-auto">
              {char.previewUrl ? (
                <audio src={char.previewUrl} controls className="h-7 w-36" />
              ) : (
                <span className="text-[10px] text-slate-400">Offline Sample</span>
              )}

              <button
                onClick={() => onOpenEditModal(char)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-white/[0.05] transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>កែប្រែ</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
