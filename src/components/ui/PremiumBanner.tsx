import React from 'react';
import { Sparkles, Crown, Zap, CheckCircle } from 'lucide-react';

interface PremiumBannerProps {
  className?: string;
}

export const PremiumBanner: React.FC<PremiumBannerProps> = ({ className = '' }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      {/* Yellow Gradient Background with Paint Stroke */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400"
          style={{
            backgroundSize: '200% auto',
            animation: 'shimmer 3s linear infinite',
          }}
        />
        {/* Paint Stroke Texture */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,50 Q25,30 50,50 T100,50' stroke='%23000' stroke-width='20' fill='none' opacity='0.1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 100px',
        }}/>
      </div>
      
      {/* Content */}
      <div className="relative px-6 py-4 flex items-center justify-between gap-4">
        {/* Left Side - Panda + 4 FREE Text */}
        <div className="flex items-center gap-4">
          {/* Panda Mascot in Black Circle */}
          <div 
            className="w-20 h-20 rounded-2xl bg-black/30 backdrop-blur-sm flex items-center justify-center shadow-xl border-2 border-black/20 relative"
            style={{ animation: 'float 3s ease-in-out infinite' }}
          >
            <span className="text-5xl">🐼</span>
          </div>
          
          {/* 4 FREE Text with Arrow */}
          <div className="relative">
            {/* Red Arrow Pointing */}
            <div className="absolute -left-16 top-1/2 -translate-y-1/2 text-red-600">
              <svg width="70" height="70" viewBox="0 0 100 100" className="animate-pulse">
                <path 
                  d="M10,50 L60,50 M40,30 L65,50 L40,70" 
                  stroke="currentColor" 
                  strokeWidth="10" 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            
            {/* Khmer Text + 4 FREE */}
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-4xl font-black text-black tracking-tight" style={{ 
                  fontFamily: 'Battambang, Noto Sans Khmer, sans-serif',
                  textShadow: '2px 2px 0 rgba(255,255,255,0.3)',
                }}>
                  ទាញយក
                </h3>
                <h3 className="text-6xl font-black text-red-600" style={{
                  fontFamily: 'Impact, Arial Black, sans-serif',
                  WebkitTextStroke: '3px white',
                  paintOrder: 'stroke fill',
                  textShadow: '4px 4px 0 rgba(0,0,0,0.2)',
                }}>
                  4 FREE
                </h3>
              </div>
              <p className="text-sm text-black/90 font-bold mt-1" style={{ 
                fontFamily: 'Noto Sans Khmer, sans-serif',
              }}>
                ទទួលបានវីដេអូ Dubbing ឥតគិតថ្លៃ ៤ រឿងក្នុងមួយថ្ងៃ!
              </p>
            </div>
          </div>
        </div>

        {/* Center Plus Icon */}
        <div className="text-black/30 flex-shrink-0">
          <svg width="50" height="50" viewBox="0 0 100 100">
            <path d="M50,20 L50,80 M20,50 L80,50" stroke="currentColor" strokeWidth="14" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Right Side - Features + VIP Badge */}
        <div className="flex items-center gap-4">
          {/* Feature Pills */}
          <div className="flex flex-col gap-2">
            {[
              { icon: Sparkles, text: 'សម្រេចភ្ជាប់AI', gradient: 'from-yellow-400 to-amber-500' },
              { icon: CheckCircle, text: 'បញ្ចូលរឿភាម', gradient: 'from-purple-500 to-pink-500' },
              { icon: Zap, text: 'គុណភាពខ្ពស់4K', gradient: 'from-green-400 to-emerald-500' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div 
                  key={i}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r ${item.gradient} shadow-lg transform hover:scale-105 transition-transform`}
                  style={{ animation: `float 3s ease-in-out infinite ${i * 0.2}s` }}
                >
                  <Icon className="w-4 h-4 text-white flex-shrink-0" />
                  <span className="text-sm font-black text-white whitespace-nowrap" style={{ 
                    fontFamily: 'Battambang, sans-serif',
                  }}>
                    ✓ {item.text}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* VIP Badge with Golden Border */}
          <div 
            className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 flex flex-col items-center justify-center shadow-2xl border-4 border-yellow-400 flex-shrink-0"
            style={{
              animation: 'float 3s ease-in-out infinite 0.5s',
              boxShadow: '0 0 40px rgba(168,85,247,0.8), 0 0 80px rgba(168,85,247,0.4)',
            }}
          >
            <Crown className="w-12 h-12 text-yellow-300 mb-1" />
            <span className="text-xl font-black text-white" style={{ 
              fontFamily: 'Impact, Arial Black, sans-serif',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}>
              VIP
            </span>
          </div>
        </div>
      </div>

      {/* Shine Overlay Effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
        style={{
          animation: 'shine 4s ease-in-out infinite',
          backgroundSize: '200% auto',
        }}
      />
    </div>
  );
};

// Inject animations into document head (runs once)
if (typeof document !== 'undefined') {
  const styleId = 'premium-banner-animations';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes shimmer {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }
      
      @keyframes shine {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `;
    document.head.appendChild(style);
  }
}
