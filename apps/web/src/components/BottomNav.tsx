import React from 'react';
import { Scroll, User, Store, BookMarked } from 'lucide-react';
import { sound } from '../lib/sound';

export type ActiveTab = 'quests' | 'character' | 'shop' | 'chronicle';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'quests' as ActiveTab, label: 'Quests', icon: Scroll },
    { id: 'character' as ActiveTab, label: 'Hero', icon: User },
    { id: 'shop' as ActiveTab, label: 'Guild Shop', icon: Store },
    { id: 'chronicle' as ActiveTab, label: 'Chronicle', icon: BookMarked },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-surface-border px-2 py-1.5 flex justify-around items-center"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              sound.playClick();
              onChangeTab(tab.id);
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-xl transition duration-150 ${
              isActive
                ? 'text-cyan-400 bg-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] font-semibold mt-1 tracking-wider uppercase">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
