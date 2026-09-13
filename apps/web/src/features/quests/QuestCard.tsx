import React, { useState } from 'react';
import { Quest } from '../../lib/types';
import { getRewardsForDifficulty } from '../../lib/rpg';
import {
  Code,
  GraduationCap,
  Dumbbell,
  BookOpen,
  Brain,
  Users,
  Palette,
  Clock,
  Calendar,
  CheckCircle,
  MoreVertical,
  Edit2,
  Archive,
  ArchiveRestore,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { sound } from '../../lib/sound';

interface QuestCardProps {
  quest: Quest;
  onComplete: (quest: Quest) => Promise<void>;
  onEdit: (quest: Quest) => void;
  onArchive: (quest: Quest) => void;
  onDelete: (quest: Quest) => void;
}

export const QuestCard: React.FC<QuestCardProps> = ({
  quest,
  onComplete,
  onEdit,
  onArchive,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [completing, setCompleting] = useState(false);

  const getCategoryIcon = () => {
    switch (quest.category) {
      case 'coding':
        return <Code className="w-4 h-4 text-cyan-400" />;
      case 'study':
        return <GraduationCap className="w-4 h-4 text-cyan-400" />;
      case 'health':
        return <Dumbbell className="w-4 h-4 text-emerald-400" />;
      case 'reading':
        return <BookOpen className="w-4 h-4 text-amber-400" />;
      case 'mindfulness':
        return <Brain className="w-4 h-4 text-purple-400" />;
      case 'social':
        return <Users className="w-4 h-4 text-pink-400" />;
      case 'creative':
        return <Palette className="w-4 h-4 text-rose-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getDifficultyBadge = () => {
    switch (quest.difficulty) {
      case 'easy':
        return { label: 'Easy', bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' };
      case 'medium':
        return { label: 'Medium', bg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' };
      case 'hard':
        return { label: 'Hard', bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
      case 'epic':
        return { label: 'Epic', bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30 shadow-sm' };
      default:
        return { label: 'Medium', bg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' };
    }
  };

  const rewards = getRewardsForDifficulty(quest.difficulty);
  const diffBadge = getDifficultyBadge();

  const isOverdue =
    quest.due_date &&
    !quest.is_completed_today &&
    new Date(quest.due_date).setHours(23, 59, 59, 999) < Date.now();

  const handleComplete = async () => {
    if (quest.is_completed_today || completing) return;
    setCompleting(true);
    sound.playQuestComplete();
    try {
      await onComplete(quest);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <article
      className={`relative rounded-2xl border transition duration-200 p-4 sm:p-5 flex flex-col justify-between ${
        quest.is_completed_today
          ? 'bg-surface/50 border-emerald-500/30 opacity-80'
          : quest.is_archived
          ? 'bg-surface/40 border-surface-border opacity-60'
          : 'bg-surface hover:border-cyan-500/40 border-surface-border shadow-card hover:shadow-moonlit'
      }`}
    >
      <div>
        {/* Card Header: Category & Badges & Menu */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-surface-light border border-surface-border inline-flex">
              {getCategoryIcon()}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 capitalize">
              {quest.category}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${diffBadge.bg}`}
            >
              {diffBadge.label}
            </span>
          </div>

          {/* Action Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMenuOpen(!menuOpen);
              }}
              aria-label="Quest options"
              className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-surface-light transition"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-surface-card border border-surface-border rounded-xl shadow-2xl p-1 z-30 animate-scaleUp">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setMenuOpen(false);
                    onEdit(quest);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-surface-light rounded-lg transition"
                >
                  <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setMenuOpen(false);
                    onArchive(quest);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-surface-light rounded-lg transition"
                >
                  {quest.is_archived ? (
                    <>
                      <ArchiveRestore className="w-3.5 h-3.5 text-amber-400" />
                      <span>Restore</span>
                    </>
                  ) : (
                    <>
                      <Archive className="w-3.5 h-3.5 text-amber-400" />
                      <span>Archive</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setMenuOpen(false);
                    onDelete(quest);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-coral hover:bg-coral/10 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h3
          className={`font-serif text-base font-bold mb-1 tracking-wide ${
            quest.is_completed_today ? 'line-through text-slate-400' : 'text-slate-100'
          }`}
        >
          {quest.title}
        </h3>

        {/* Description */}
        {quest.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {quest.description}
          </p>
        )}

        {/* Quest Meta: Time & Due Date */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mb-4">
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{quest.estimated_minutes} min</span>
          </div>
          {quest.due_date && (
            <div
              className={`flex items-center space-x-1 font-medium ${
                isOverdue ? 'text-coral' : 'text-slate-400'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {isOverdue ? 'Overdue: ' : 'Due: '}
                {new Date(quest.due_date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Bounty & Complete Button */}
      <div className="pt-3 border-t border-surface-border flex items-center justify-between mt-auto">
        <div className="flex items-center space-x-2 text-xs font-semibold">
          <span className="text-cyan-400">+{rewards.xp} XP</span>
          <span className="text-amber-400">+{rewards.gold} Gold</span>
        </div>

        {quest.is_completed_today ? (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-sm">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Fulfilled Today</span>
          </div>
        ) : quest.is_archived ? (
          <span className="text-xs text-slate-500 italic">Archived</span>
        ) : (
          <button
            type="button"
            onClick={handleComplete}
            disabled={completing}
            aria-label={`Complete quest ${quest.title}`}
            className="group relative inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 text-xs font-bold tracking-wider uppercase transition shadow-sm hover:shadow-moonlit active:scale-95 disabled:opacity-50"
          >
            <CheckCircle className="w-3.5 h-3.5 group-hover:scale-110 transition text-cyan-300" />
            <span>{completing ? 'Fulfilling...' : 'Fulfill'}</span>
          </button>
        )}
      </div>
    </article>
  );
};
