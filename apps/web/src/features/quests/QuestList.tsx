import React, { useState, useMemo } from 'react';
import { useQuests } from '../../hooks/useQuests';
import { QuestCard } from './QuestCard';
import { QuestModal } from './QuestModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { Quest, QuestCategory, RewardSummary } from '../../lib/types';
import { QuestFormData } from '../../lib/validation';
import { Skeleton } from '../../components/Skeleton';
import { Button } from '../../components/Button';
import { Plus, Search, Filter, Scroll, CheckCircle2, AlertOctagon, Archive } from 'lucide-react';
import { sound } from '../../lib/sound';

interface QuestListProps {
  onQuestReward?: (reward: RewardSummary) => void;
}

export type QuestFilterTab = 'active' | 'completed' | 'overdue' | 'archived';

export const QuestList: React.FC<QuestListProps> = ({ onQuestReward }) => {
  const {
    quests,
    isLoading,
    createQuest,
    updateQuest,
    toggleArchive,
    deleteQuest,
    completeQuest,
  } = useQuests();

  const [activeTab, setActiveTab] = useState<QuestFilterTab>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [deletingQuest, setDeletingQuest] = useState<Quest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredQuests = useMemo(() => {
    return quests.filter((quest) => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = quest.title.toLowerCase().includes(query);
        const matchesDesc = quest.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && quest.category !== selectedCategory) {
        return false;
      }

      // Tab filters
      const isOverdue =
        quest.due_date &&
        !quest.is_completed_today &&
        new Date(quest.due_date).setHours(23, 59, 59, 999) < Date.now();

      if (activeTab === 'active') {
        return !quest.is_archived && !quest.is_completed_today;
      }
      if (activeTab === 'completed') {
        return !quest.is_archived && quest.is_completed_today;
      }
      if (activeTab === 'overdue') {
        return !quest.is_archived && isOverdue;
      }
      if (activeTab === 'archived') {
        return quest.is_archived;
      }

      return true;
    });
  }, [quests, activeTab, searchQuery, selectedCategory]);

  const handleOpenCreate = () => {
    sound.playClick();
    setEditingQuest(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (quest: Quest) => {
    sound.playClick();
    setEditingQuest(quest);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: QuestFormData) => {
    if (editingQuest) {
      await updateQuest(editingQuest.id, data);
    } else {
      await createQuest(data);
    }
  };

  const handleCompleteQuest = async (quest: Quest) => {
    const reward = await completeQuest(quest);
    if (onQuestReward) {
      onQuestReward(reward);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingQuest) return;
    setIsDeleting(true);
    try {
      await deleteQuest(deletingQuest.id);
      setDeletingQuest(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const tabCounts = useMemo(() => {
    const active = quests.filter((q) => !q.is_archived && !q.is_completed_today).length;
    const completed = quests.filter((q) => !q.is_archived && q.is_completed_today).length;
    const overdue = quests.filter((q) => {
      const isO =
        q.due_date &&
        !q.is_completed_today &&
        new Date(q.due_date).setHours(23, 59, 59, 999) < Date.now();
      return !q.is_archived && isO;
    }).length;
    const archived = quests.filter((q) => q.is_archived).length;
    return { active, completed, overdue, archived };
  }, [quests]);

  return (
    <div className="space-y-5">
      {/* Header & Forge Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Today's Quests</span>
          </h2>
          <p className="text-xs text-slate-400">
            Fulfill daily deeds to gather Essence and forge heroic momentum.
          </p>
        </div>

        <Button onClick={handleOpenCreate} variant="primary" size="md">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Forge New Quest</span>
        </Button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search */}
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quest scrolls by keyword..."
            className="w-full pl-9 pr-3 py-2 bg-surface-card border border-surface-border rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
          />
        </div>

        {/* Category Select */}
        <div className="sm:col-span-4 relative">
          <Filter className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-surface-card border border-surface-border rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
          >
            <option value="all">All Disciplines</option>
            <option value="coding">Coding (Intellect)</option>
            <option value="study">Study (Intellect)</option>
            <option value="health">Health (Strength)</option>
            <option value="reading">Reading (Wisdom)</option>
            <option value="mindfulness">Mindfulness (Wisdom)</option>
            <option value="social">Social (Charisma)</option>
            <option value="creative">Creative (Charisma)</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-border space-x-1 sm:space-x-4 overflow-x-auto pb-1">
        {[
          { id: 'active', label: 'Active', count: tabCounts.active, icon: Scroll },
          { id: 'completed', label: 'Fulfilled', count: tabCounts.completed, icon: CheckCircle2 },
          { id: 'overdue', label: 'Overdue', count: tabCounts.overdue, icon: AlertOctagon },
          { id: 'archived', label: 'Archived', count: tabCounts.archived, icon: Archive },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab(tab.id as QuestFilterTab);
              }}
              className={`flex items-center space-x-1.5 py-2 px-3 text-xs font-semibold rounded-t-lg transition border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-cyan-400 text-cyan-300 bg-surface-light/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-surface-card text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quests Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-44 w-full" count={4} />
        </div>
      ) : filteredQuests.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-surface-border bg-surface/30">
          <Scroll className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="font-serif text-slate-300 font-bold text-sm">
            {activeTab === 'active'
              ? 'No active quests found in the guild log.'
              : activeTab === 'completed'
              ? 'No quests fulfilled yet today. Seize the day!'
              : activeTab === 'overdue'
              ? 'No overdue quests. Your discipline holds firm!'
              : 'Archive is empty.'}
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Forge a new habit or objective to start gathering Essence and Guild Gold.
          </p>
          {activeTab === 'active' && (
            <Button
              onClick={handleOpenCreate}
              variant="primary"
              size="sm"
              className="mt-4"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Forge Your First Quest</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onComplete={handleCompleteQuest}
              onEdit={handleOpenEdit}
              onArchive={toggleArchive}
              onDelete={(q) => setDeletingQuest(q)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <QuestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialQuest={editingQuest}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingQuest)}
        onClose={() => setDeletingQuest(null)}
        onConfirm={handleConfirmDelete}
        quest={deletingQuest}
        isDeleting={isDeleting}
      />
    </div>
  );
};
