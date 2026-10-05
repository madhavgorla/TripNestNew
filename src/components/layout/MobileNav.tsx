import React from 'react';
import { LayoutDashboard, Compass, Globe, Sparkles, WalletCards } from 'lucide-react';

interface MobileNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, onSelectTab }) => {
  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'trips', label: 'Trips', icon: Compass },
    { id: 'ai-copilot', label: 'AI Copilot', icon: Sparkles, isAi: true },
    { id: 'discover', label: 'Discover', icon: Globe },
    { id: 'budget', label: 'Budget', icon: WalletCards },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-14 items-center justify-around border-t border-slate-200 bg-white/95 px-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 text-[10px] font-medium transition-colors ${
              isActive
                ? item.isAi
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-900 dark:text-white font-bold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Icon className={`w-4 h-4 ${item.isAi && isActive ? 'animate-pulse' : ''}`} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
