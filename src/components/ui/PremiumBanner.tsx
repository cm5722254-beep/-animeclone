import React from 'react';
import { Sparkles, Crown, Zap } from 'lucide-react';

interface PremiumBannerProps {
  className?: string;
}

export const PremiumBanner: React.FC<PremiumBannerProps> = ({ className = '' }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 animate-pulse-glow" />
      
      {/* Content */}
      <div className="relative px-6 py-4 flex items-center justify-between">
        {/* Left Side - Panda Mascot */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center animate-float">
            <span className="text-4xl">🐼</span>
          </div>
          
          <div className="text-khmer-bold">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <h3 className="text-xl font-black text-black">ទាញយក 4 FREE</h3>
            </div>
            <p className="text-sm text-black/80 font-semibold">
              ទទួលបានវីដេអូ Dubbing ឥតគិតថ្លៃ 4 រឿងក្នុងមួយថ្ងៃ!
            </p>
          </div>
        </div>

        {/* Right Side - VIP Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right text-khmer">
            <div className="flex items-center gap-2 justify-end mb-1">
              <Crown className="w-5 h-5 text-yellow-300" />
              <span className="text-lg font-black text-black">VIP មិនកំណត់</span>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-black/20 text-xs font-bold text-black">
                <Zap className="w-3 h-3" />
                <span className="text-khmer">រាប់ភ្ជាប់AI</span>
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-black/20 text-xs font-bold text-black">
                <span className="text-khmer">គុណភាពខ្ពស់</span>
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-black/20 text-xs font-bold text-black">
                <span className="text-khmer">ត្រូវម៉ោងគ្នា</span>
              </span>
            </div>
          </div>
          
          {/* VIP Icon */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.6)] animate-float" style={{ animationDelay: '0.5s' }}>
            <Crown className="w-10 h-10 text-yellow-300" />
          </div>
        </div>
      </div>

      {/* Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2.5s_infinite]" />
    </div>
  );
};
