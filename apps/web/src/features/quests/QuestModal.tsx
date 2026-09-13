import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Quest, QuestCategory, QuestDifficulty } from '../../lib/types';
import { QuestFormData, questSchema } from '../../lib/validation';
import { getRewardsForDifficulty, getAttributeForCategory } from '../../lib/rpg';
import { Sparkles, Clock, Calendar, AlertCircle } from 'lucide-react';

interface QuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QuestFormData) => Promise<any>;
  initialQuest?: Quest | null;
}

export const QuestModal: React.FC<QuestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialQuest,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<QuestCategory>('coding');
  const [difficulty, setDifficulty] = useState<QuestDifficulty>('medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialQuest) {
      setTitle(initialQuest.title);
      setDescription(initialQuest.description || '');
      setCategory(initialQuest.category);
      setDifficulty(initialQuest.difficulty);
      setEstimatedMinutes(initialQuest.estimated_minutes || 30);
      setDueDate(initialQuest.due_date ? initialQuest.due_date.split('T')[0] : '');
    } else {
      setTitle('');
      setDescription('');
      setCategory('coding');
      setDifficulty('medium');
      setEstimatedMinutes(30);
      setDueDate('');
    }
    setErrors({});
  }, [initialQuest, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData: QuestFormData = {
      title,
      description,
      category,
      difficulty,
      estimated_minutes: Number(estimatedMinutes),
      due_date: dueDate ? dueDate : null,
    };

    const result = questSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(result.data);
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to record quest scroll' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewRewards = getRewardsForDifficulty(difficulty);
  const previewAttribute = getAttributeForCategory(category);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialQuest ? 'Revise Quest Scroll' : 'Forge New Quest'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-coral/10 border border-coral/30 text-coral text-xs flex items-center space-x-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="quest-title" className="block text-xs font-semibold text-slate-300 mb-1">
            Quest Title <span className="text-coral">*</span>
          </label>
          <input
            id="quest-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Complete Python practice set"
            maxLength={120}
            className={`w-full px-3 py-2 bg-surface-card border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition ${
              errors.title
                ? 'border-coral focus:border-coral focus:ring-1 focus:ring-coral'
                : 'border-surface-border focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
            }`}
          />
          {errors.title && (
            <p className="text-coral text-xs mt-1 font-medium">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="quest-desc" className="block text-xs font-semibold text-slate-300 mb-1">
            Lore & Directives (Description)
          </label>
          <textarea
            id="quest-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Details, subtasks, or milestones..."
            rows={2}
            className="w-full px-3 py-2 bg-surface-card border border-surface-border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
          />
        </div>

        {/* Category & Difficulty Grids */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Discipline (Category)
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as QuestCategory)}
              className="w-full px-3 py-2 bg-surface-card border border-surface-border rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
            >
              <option value="coding">Coding (Intellect +1)</option>
              <option value="study">Study (Intellect +1)</option>
              <option value="health">Health & Gym (Strength +1)</option>
              <option value="reading">Reading (Wisdom +1)</option>
              <option value="mindfulness">Mindfulness (Wisdom +1)</option>
              <option value="social">Social (Charisma +1)</option>
              <option value="creative">Creative (Charisma +1)</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Challenge Tier (Difficulty)
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as QuestDifficulty)}
              className="w-full px-3 py-2 bg-surface-card border border-surface-border rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
            >
              <option value="easy">Easy (25 XP, 10 Gold)</option>
              <option value="medium">Medium (60 XP, 25 Gold)</option>
              <option value="hard">Hard (130 XP, 55 Gold)</option>
              <option value="epic">Epic (260 XP, 110 Gold)</option>
            </select>
          </div>
        </div>

        {/* Estimated Minutes & Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="quest-duration" className="block text-xs font-semibold text-slate-300 mb-1">
              Estimated Duration (Minutes)
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                id="quest-duration"
                type="number"
                min={1}
                max={1440}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(parseInt(e.target.value) || 0)}
                className={`w-full pl-9 pr-3 py-2 bg-surface-card border rounded-xl text-sm text-slate-100 focus:outline-none transition ${
                  errors.estimated_minutes
                    ? 'border-coral focus:border-coral focus:ring-1 focus:ring-coral'
                    : 'border-surface-border focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                }`}
              />
            </div>
            {errors.estimated_minutes && (
              <p className="text-coral text-xs mt-1 font-medium">{errors.estimated_minutes}</p>
            )}
          </div>

          <div>
            <label htmlFor="quest-due-date" className="block text-xs font-semibold text-slate-300 mb-1">
              Target Deadline (Optional)
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                id="quest-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-card border border-surface-border rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
            </div>
          </div>
        </div>

        {/* Reward Preview Card */}
        <div className="p-3 rounded-xl bg-surface-light border border-surface-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span className="text-xs font-semibold text-slate-300">Reward Bounty:</span>
          </div>
          <div className="flex items-center space-x-3 text-xs font-bold">
            <span className="text-cyan-300">+{previewRewards.xp} XP</span>
            <span className="text-amber-400">+{previewRewards.gold} Gold</span>
            <span className="text-emerald-400 capitalize">+{previewAttribute}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Discard
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {initialQuest ? 'Seal Revisions' : 'Inscribe Quest'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
