import React, { useState } from 'react';
import { TopBar } from '../components/TopBar';
import { BottomNav, ActiveTab } from '../components/BottomNav';
import { HeroCard } from '../features/character/HeroCard';
import { AttributeGrid } from '../features/character/AttributeGrid';
import { LevelUpModal } from '../features/character/LevelUpModal';
import { QuestList } from '../features/quests/QuestList';
import { ShopPage } from '../features/shop/ShopPage';
import { ChroniclePage } from '../features/chronicle/ChroniclePage';
import { RewardSummary } from '../lib/types';
import { useAuth } from '../features/auth/AuthContext';
import { Scroll, User, Store, BookMarked } from 'lucide-react';
import { sound } from '../lib/sound';

export const DashboardPage: React.FC = () => {
  const { equippedTheme } = useAuth();
  const [currentTab, setCurrentTab] = useState<ActiveTab>('quests');

  // Level Up Celebration state
  const [levelUpData, setLevelUpData] = useState<{
    isOpen: boolean;
    oldLevel: number;
    newLevel: number;
  }>({
    isOpen: false,
    oldLevel: 1,
    newLevel: 1,
  });

  const handleQuestReward = (reward: RewardSummary) => {
    if (reward.newLevel > reward.oldLevel) {
      setLevelUpData({
        isOpen: true,
        oldLevel: reward.oldLevel,
        newLevel: reward.newLevel,
      });
    }
  };

  // Dynamic theme background styles based on equipped theme
  const themeBgColor = equippedTheme?.metadata?.bgColor || '#0b1020';

  return (
    <div
      className="min-h-screen text-slate-100 flex flex-col pb-20 md:pb-10 transition-colors duration-500"
      style={{ backgroundColor: themeBgColor }}
    >
      {/* Top Bar Navigation */}
      <TopBar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Desktop Tab Switcher */}
        <div className="hidden md:flex items-center space-x-2 mb-6 border-b border-surface-border pb-2">
          {[
            { id: 'quests' as ActiveTab, label: 'Hall of Quests', icon: Scroll },
            { id: 'character' as ActiveTab, label: 'Hero Sanctum', icon: User },
            { id: 'shop' as ActiveTab, label: 'Guild Shop', icon: Store },
            { id: 'chronicle' as ActiveTab, label: 'Daily Chronicle', icon: BookMarked },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setCurrentTab(tab.id);
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                  isActive
                    ? 'bg-surface border border-cyan-500/40 text-cyan-300 shadow-moonlit'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-surface/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Views */}
        {currentTab === 'quests' && (
          <div className="space-y-6">
            {/* Hero Card Banner */}
            <HeroCard />

            {/* Two Column Layout for Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Main Column: Quests */}
              <div className="lg:col-span-8">
                <QuestList onQuestReward={handleQuestReward} />
              </div>

              {/* Side Column: Attributes & Quick Chronicle */}
              <aside className="lg:col-span-4 space-y-6">
                <AttributeGrid />

                {/* Quick Shop / Chronicle Teaser Card */}
                <div className="p-5 rounded-3xl bg-surface border border-surface-border shadow-card space-y-3">
                  <div className="flex items-center space-x-2 text-amber-400">
                    <Store className="w-4 h-4" />
                    <h3 className="font-serif text-sm font-bold text-slate-200">
                      Guild Merchant's Notice
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Rare badges and radiant hall themes await worthy champions in the Guild Shop. Exchange earned Gold to adorn your guild crest!
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setCurrentTab('shop');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider transition text-center"
                  >
                    Visit Guild Shop
                  </button>
                </div>
              </aside>
            </div>
          </div>
        )}

        {currentTab === 'character' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <HeroCard />
            <AttributeGrid />
          </div>
        )}

        {currentTab === 'shop' && (
          <div className="max-w-6xl mx-auto">
            <ShopPage />
          </div>
        )}

        {currentTab === 'chronicle' && (
          <div className="max-w-5xl mx-auto">
            <ChroniclePage />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={currentTab} onChangeTab={setCurrentTab} />

      {/* Level Up Celebration Modal */}
      <LevelUpModal
        isOpen={levelUpData.isOpen}
        onClose={() => setLevelUpData((prev) => ({ ...prev, isOpen: false }))}
        oldLevel={levelUpData.oldLevel}
        newLevel={levelUpData.newLevel}
      />
    </div>
  );
};
