import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { supabase, localDb, isSupabaseConfigured } from '../lib/supabase';
import { Quest, RewardSummary } from '../lib/types';
import { QuestFormData, questSchema } from '../lib/validation';
import { useAnnounce } from '../components/Announcer';

export function useQuests() {
  const { user, isDemoMode, refreshProfile } = useAuth();
  const { announce, toast } = useAnnounce();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isDemoMode) {
        const data = localDb.getQuests();
        setQuests(data);
        return;
      }

      if (supabase && user) {
        // Fetch active/all user quests
        const { data: questData, error: qErr } = await supabase
          .from('quests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (qErr) throw qErr;

        // Fetch completions for today to mark is_completed_today
        const today = new Date().toISOString().split('T')[0];
        const { data: compData, error: cErr } = await supabase
          .from('quest_completions')
          .select('quest_id')
          .eq('user_id', user.id)
          .eq('completed_on', today);

        if (cErr) throw cErr;

        const completedSet = new Set((compData || []).map((c) => c.quest_id));
        const enriched = (questData || []).map((q) => ({
          ...q,
          is_completed_today: completedSet.has(q.id),
        }));

        setQuests(enriched);
      }
    } catch (err: any) {
      console.error('Failed to load quests:', err);
      setError(err.message || 'Could not load quests');
      toast('Failed to load quests', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isDemoMode, user, toast]);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const createQuest = async (formData: QuestFormData) => {
    // Validate with Zod
    const parsed = questSchema.safeParse(formData);
    if (!parsed.success) {
      throw new Error(parsed.error.errors[0].message);
    }

    if (isDemoMode) {
      const newQuest = localDb.createQuest({
        title: parsed.data.title,
        description: parsed.data.description || '',
        category: parsed.data.category,
        difficulty: parsed.data.difficulty,
        estimated_minutes: parsed.data.estimated_minutes,
        due_date: parsed.data.due_date || null,
      });
      setQuests((prev) => [newQuest, ...prev]);
      toast(`Quest "${newQuest.title}" accepted!`, 'success');
      announce(`New quest ${newQuest.title} accepted into log`);
      return newQuest;
    }

    if (supabase && user) {
      const { data, error: insertErr } = await supabase
        .from('quests')
        .insert({
          user_id: user.id,
          title: parsed.data.title,
          description: parsed.data.description || '',
          category: parsed.data.category,
          difficulty: parsed.data.difficulty,
          estimated_minutes: parsed.data.estimated_minutes,
          due_date: parsed.data.due_date || null,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      const created = { ...data, is_completed_today: false };
      setQuests((prev) => [created, ...prev]);
      toast(`Quest "${created.title}" accepted!`, 'success');
      announce(`New quest ${created.title} accepted into log`);
      return created;
    }
  };

  const updateQuest = async (id: string, formData: Partial<QuestFormData>) => {
    if (isDemoMode) {
      const updated = localDb.updateQuest(id, formData);
      setQuests((prev) => prev.map((q) => (q.id === id ? { ...q, ...updated } : q)));
      toast('Quest scroll updated', 'info');
      return updated;
    }

    if (supabase && user) {
      const { data, error: updateErr } = await supabase
        .from('quests')
        .update(formData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateErr) throw updateErr;
      setQuests((prev) => prev.map((q) => (q.id === id ? { ...q, ...data } : q)));
      toast('Quest scroll updated', 'info');
      return data;
    }
  };

  const toggleArchive = async (quest: Quest) => {
    const updatedArchived = !quest.is_archived;
    if (isDemoMode) {
      localDb.updateQuest(quest.id, { is_archived: updatedArchived });
      setQuests((prev) =>
        prev.map((q) => (q.id === quest.id ? { ...q, is_archived: updatedArchived } : q))
      );
      toast(updatedArchived ? 'Quest archived' : 'Quest restored', 'info');
      return;
    }

    if (supabase && user) {
      const { error: patchErr } = await supabase
        .from('quests')
        .update({ is_archived: updatedArchived })
        .eq('id', quest.id)
        .eq('user_id', user.id);

      if (patchErr) throw patchErr;
      setQuests((prev) =>
        prev.map((q) => (q.id === quest.id ? { ...q, is_archived: updatedArchived } : q))
      );
      toast(updatedArchived ? 'Quest archived' : 'Quest restored', 'info');
    }
  };

  const deleteQuest = async (id: string) => {
    if (isDemoMode) {
      localDb.deleteQuest(id);
      setQuests((prev) => prev.filter((q) => q.id !== id));
      toast('Quest purged from chronicle', 'info');
      return;
    }

    if (supabase && user) {
      const { error: delErr } = await supabase
        .from('quests')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (delErr) throw delErr;
      setQuests((prev) => prev.filter((q) => q.id !== id));
      toast('Quest purged from chronicle', 'info');
    }
  };

  const completeQuest = async (quest: Quest): Promise<RewardSummary> => {
    if (quest.is_completed_today) {
      throw new Error('Quest has already been fulfilled today!');
    }

    // Optimistic UI state update
    const previousQuests = [...quests];
    setQuests((prev) =>
      prev.map((q) => (q.id === quest.id ? { ...q, is_completed_today: true } : q))
    );

    try {
      let summary: RewardSummary;

      if (isDemoMode) {
        summary = localDb.completeQuest(quest.id);
      } else if (supabase) {
        // Call backend RPC
        const { data, error: rpcErr } = await supabase.rpc('complete_quest', {
          p_quest_id: quest.id,
        });
        if (rpcErr) throw rpcErr;
        summary = data as RewardSummary;
      } else {
        throw new Error('Database connection unavailable');
      }

      await refreshProfile();
      return summary;
    } catch (err: any) {
      // Rollback optimistic update
      setQuests(previousQuests);
      toast(`Quest completion failed: ${err.message}`, 'error');
      announce(`Failed to complete quest: ${err.message}`, 'assertive');
      throw err;
    }
  };

  return {
    quests,
    isLoading,
    error,
    fetchQuests,
    createQuest,
    updateQuest,
    toggleArchive,
    deleteQuest,
    completeQuest,
  };
}
