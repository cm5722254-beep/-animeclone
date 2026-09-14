import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface TabPill {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: string | number;
}

interface TabPillsProps {
  tabs: TabPill[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const TabPills: React.FC<TabPillsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              pill-button text-khmer
              ${isActive ? 'active' : ''}
            `}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={`
                px-1.5 py-0.5 rounded-full text-[10px] font-black
                ${isActive 
                  ? 'bg-sky-500/30 text-sky-200' 
                  : 'bg-white/[0.1] text-slate-400'
                }
              `}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
