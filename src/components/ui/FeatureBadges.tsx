import React from 'react';
import { Sparkles, Zap, CheckCircle } from 'lucide-react';

interface FeatureBadgesProps {
  className?: string;
}

export const FeatureBadges: React.FC<FeatureBadgesProps> = ({ className = '' }) => {
  const features = [
    {
      icon: Sparkles,
      text: 'សម្រេចផ្ទាល់AI',
      color: 'from-yellow-500 to-amber-600',
      textColor: 'text-yellow-300',
      glow: 'shadow-[0_0_20px_rgba(251,191,36,0.4)]',
    },
    {
      icon: Zap,
      text: 'បញ្ចូលភ្លាម',
      color: 'from-purple-600 to-pink-600',
      textColor: 'text-purple-300',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    },
    {
      icon: CheckCircle,
      text: 'គុណភាពខ្ពស់4K',
      color: 'from-emerald-500 to-green-600',
      textColor: 'text-emerald-300',
      glow: 'shadow-[0_0_20px_rgba(52,211,153,0.4)]',
    },
  ];

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <div
            key={index}
            className={`
              flex items-center gap-3 px-4 py-2.5 rounded-xl
              bg-gradient-to-r ${feature.color}
              ${feature.glow}
              transform transition-all duration-300
              hover:scale-[1.02] hover:brightness-110
              cursor-pointer
            `}
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-black/20">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <span className={`text-sm font-black ${feature.textColor} text-khmer-bold`}>
              {feature.text}
            </span>
            <div className="ml-auto">
              <CheckCircle className="w-5 h-5 text-white/80" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
