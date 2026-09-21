import React from 'react';
import { Layers, Timer, FileText, Bookmark, Smartphone, BookOpen } from 'lucide-react';
import { AppTab } from '../types';

interface AndroidBottomNavProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  savedCount: number;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeTab,
  onSelectTab,
  savedCount,
}) => {
  const tabs = [
    { id: 'tests' as AppTab, label: 'Mock Tests', icon: Layers },
    { id: 'pyq' as AppTab, label: 'PYQ Bank', icon: BookOpen },
    { id: 'cbt' as AppTab, label: 'CBT Exam', icon: Timer },
    { id: 'paper' as AppTab, label: 'Papers', icon: FileText },
    { id: 'saved' as AppTab, label: 'Saved', icon: Bookmark, badge: savedCount },
    { id: 'app' as AppTab, label: 'Blog & App', icon: Smartphone },
  ];

  return (
    <nav className="flex-shrink-0 bg-slate-900 border-t border-slate-800/80 px-1 py-1.5 z-30 select-none backdrop-blur-md">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl transition-all duration-200 ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {/* Material You Pill Indicator */}
              <div
                className={`relative px-2.5 sm:px-3 py-1 rounded-full flex items-center justify-center transition-all ${
                  isActive ? 'bg-sky-500/20 text-sky-400 shadow-sm' : 'bg-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[15px] h-3.5 px-1 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center shadow">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[9px] sm:text-[10px] mt-0.5 tracking-tight truncate max-w-[58px] ${
                  isActive ? 'font-bold text-sky-400' : 'font-medium text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

