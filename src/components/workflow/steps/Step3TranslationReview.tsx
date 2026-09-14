import React, { useState } from 'react';
import { TimelineSegment } from '../../../types';
import { ChevronRight, FileText, CheckCircle2, AlertCircle, Save, Clock, Undo, Redo, Languages } from 'lucide-react';

interface Step3TranslationReviewProps {
  segments: TimelineSegment[];
  onChangeSegments: (segments: TimelineSegment[]) => void;
  onNext: () => void;
  onBack: () => void;
  onShowToast: (msg: string, type: 'success'|'error'|'info') => void;
}

export const Step3TranslationReview: React.FC<Step3TranslationReviewProps> = ({
  segments,
  onChangeSegments,
  onNext,
  onBack,
  onShowToast
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [reviewedLines, setReviewedLines] = useState<Set<number>>(new Set());

  const handleEditClick = (index: number, currentText: string) => {
    setEditingIndex(index);
    setEditValue(currentText);
  };

  const handleSaveEdit = (index: number) => {
    const updated = [...segments];
    updated[index] = { ...updated[index], khmer_translation: editValue, status: 'approved' };
    onChangeSegments(updated);
    setEditingIndex(null);
    setReviewedLines(prev => new Set(prev).add(index));
  };

  const markAllApproved = () => {
    const allReviewed = new Set(segments.map((_, i) => i));
    setReviewedLines(allReviewed);
    const updated = segments.map(s => ({ ...s, status: 'approved' }));
    onChangeSegments(updated);
    onShowToast('បានយល់ព្រមលើការបកប្រែទាំងអស់', 'success');
  };

  const totalLines = segments.length;
  const approvedLines = reviewedLines.size;
  const needReview = totalLines - approvedLines;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span className="font-mono font-bold text-amber-400">ជំហានទី ៣ នៃ ៦</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">ពិនិត្យការបកប្រែ</h2>
            <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
              កែសម្រួលការបកប្រែឲ្យត្រឹមត្រូវ មុននឹងបន្តទៅជំហានជ្រើសសំឡេង។
            </p>
          </div>
          <div className="flex items-center gap-4 bg-[#0a0e1a] border border-white/10 p-3 rounded-xl">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Status</span>
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {approvedLines} Approved
                </span>
                {needReview > 0 && (
                  <span className="text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {needReview} Need Review
                  </span>
                )}
              </div>
            </div>
            {needReview > 0 && (
              <button 
                onClick={markAllApproved}
                className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-[11px] font-bold border border-emerald-500/20"
              >
                Approve All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="flex-1 px-8 pb-4 min-h-0 overflow-hidden">
        <div className="h-full rounded-2xl border border-white/10 bg-[#0a0e1a] flex flex-col">
          {/* Table Header */}
          <div className="grid grid-cols-[60px_100px_140px_1fr_1fr_100px] gap-4 p-3 bg-white/5 border-b border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-wider items-center">
            <div className="text-center">#</div>
            <div>Time</div>
            <div>Character</div>
            <div>Original (CN)</div>
            <div>Khmer Translation</div>
            <div className="text-center">Status</div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto p-1 custom-scrollbar">
            {segments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                <FileText className="w-8 h-8 opacity-50" />
                <p className="text-sm">មិនមានទិន្នន័យបកប្រែ។ សូមត្រឡប់ទៅស្កេនវីដេអូវិញ។</p>
              </div>
            ) : (
              segments.map((seg, idx) => (
                <div 
                  key={idx} 
                  className={`grid grid-cols-[60px_100px_140px_1fr_1fr_100px] gap-4 p-3 items-center border-b border-white/5 hover:bg-white/5 transition-colors ${
                    editingIndex === idx ? 'bg-indigo-500/5' : ''
                  }`}
                >
                  <div className="text-center text-xs font-mono text-slate-500">
                    {(idx + 1).toString().padStart(3, '0')}
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-sky-400/80 bg-sky-500/10 px-2 py-1 rounded w-max">
                    <Clock className="w-3 h-3" />
                    {seg.start_time.toFixed(1)}s
                  </div>
                  
                  <div className="text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2 py-1 rounded w-max truncate max-w-[120px]">
                    {seg.speaker_name || seg.speaker_id || 'Unknown'}
                  </div>
                  
                  <div className="text-xs text-slate-400">
                    {seg.chinese_text}
                  </div>
                  
                  <div className="text-sm font-semibold text-white">
                    {editingIndex === idx ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(idx);
                            if (e.key === 'Escape') setEditingIndex(null);
                          }}
                          className="flex-1 bg-[#04060a] border border-indigo-500/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-400 font-khmer"
                          autoFocus
                        />
                        <button 
                          onClick={() => handleSaveEdit(idx)}
                          className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="cursor-pointer hover:bg-white/10 p-1.5 rounded-lg -ml-1.5 transition-colors font-khmer"
                        onClick={() => handleEditClick(idx, seg.khmer_translation || '')}
                      >
                        {seg.khmer_translation}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center flex justify-center">
                    {reviewedLines.has(idx) ? (
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/20">
                        Review
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {needReview > 0 && segments.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-amber-400 bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-semibold">⚠ សូមពិនិត្យការបកប្រែដែលនៅសល់ មុននឹងបន្ត។</span>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="shrink-0 px-8 py-4 bg-[#04060a] border-t border-white/[0.05]">
        <div className="flex items-center justify-between max-w-5xl">
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold transition-all"
          >
            ← ត្រឡប់ក្រោយ
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => onShowToast('បានរក្សាទុក (Saved)', 'success')}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> រក្សាទុក
            </button>
            <button
              onClick={onNext}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                'bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white shadow-lg shadow-emerald-500/25'
              }`}
            >
              <span>បន្ត</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
