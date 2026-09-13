import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { supabase, localDb } from '../../lib/supabase';
import { GoldLedgerEntry, QuestCompletion } from '../../lib/types';
import { Calendar, History, Coins, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export const ChroniclePage: React.FC = () => {
  const { user, isDemoMode } = useAuth();
  const [completions, setCompletions] = useState<QuestCompletion[]>([]);
  const [ledger, setLedger] = useState<GoldLedgerEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (isDemoMode) {
          setCompletions(localDb.getCompletions());
          setLedger(localDb.getLedger());
          return;
        }

        if (supabase && user) {
          const { data: compData } = await supabase
            .from('quest_completions')
            .select('*')
            .eq('user_id', user.id)
            .order('completed_on', { ascending: false });

          const { data: ledData } = await supabase
            .from('gold_ledger')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          setCompletions((compData as QuestCompletion[]) || []);
          setLedger((ledData as GoldLedgerEntry[]) || []);
        }
      } catch (err) {
        console.error('Failed to load chronicle logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isDemoMode, user]);

  // Generate 28-day activity heatmap
  const heatmapDays = React.useMemo(() => {
    const days: { dateStr: string; label: string; count: number }[] = [];
    const countsByDate = new Map<string, number>();

    completions.forEach((c) => {
      countsByDate.set(c.completed_on, (countsByDate.get(c.completed_on) || 0) + 1);
    });

    for (let i = 27; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const count = countsByDate.get(dateStr) || 0;
      days.push({
        dateStr,
        label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        count,
      });
    }
    return days;
  }, [completions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl font-bold text-slate-100 flex items-center space-x-2">
          <span>Daily Chronicle & Guild Ledger</span>
        </h2>
        <p className="text-xs text-slate-400">
          A tamper-evident audit history of all deeds performed, Essence acquired, and gold spent.
        </p>
      </div>

      {/* Activity Heatmap Grid */}
      <div className="rounded-3xl bg-surface border border-surface-border p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <h3 className="font-serif text-base font-bold text-slate-200">
              Quest Completion Intensity (Past 28 Days)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Total Deeds: {completions.length}
          </span>
        </div>

        {/* Heatmap Squares */}
        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 pt-2">
          {heatmapDays.map((day) => {
            let bgClass = 'bg-surface-card border-surface-border';
            if (day.count === 1) bgClass = 'bg-cyan-500/30 border-cyan-500/50 shadow-sm';
            else if (day.count === 2) bgClass = 'bg-cyan-400/60 border-cyan-400 shadow-sm';
            else if (day.count >= 3) bgClass = 'bg-cyan-300 border-cyan-200 shadow-moonlit';

            return (
              <div
                key={day.dateStr}
                title={`${day.label}: ${day.count} quests fulfilled`}
                className={`h-9 rounded-xl border flex flex-col items-center justify-center transition duration-150 hover:scale-105 ${bgClass}`}
              >
                <span className="text-[9px] font-bold text-slate-300">
                  {day.dateStr.slice(8)}
                </span>
                {day.count > 0 && (
                  <span className="text-[8px] font-mono font-bold text-slate-900">
                    +{day.count}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end space-x-2 text-[10px] text-slate-400 pt-2">
          <span>Less</span>
          <span className="w-3 h-3 rounded bg-surface-card border border-surface-border" />
          <span className="w-3 h-3 rounded bg-cyan-500/30 border border-cyan-500/50" />
          <span className="w-3 h-3 rounded bg-cyan-400/60 border border-cyan-400" />
          <span className="w-3 h-3 rounded bg-cyan-300 border border-cyan-200" />
          <span>More</span>
        </div>
      </div>

      {/* Transaction & Audit Ledger */}
      <div className="rounded-3xl bg-surface border border-surface-border p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-amber-400" />
            <h3 className="font-serif text-base font-bold text-slate-200">
              Gold & Essence Ledger Transactions
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            {ledger.length} Logged Entries
          </span>
        </div>

        {loading ? (
          <p className="text-xs text-slate-500 py-6 text-center">Consulting ledger archives...</p>
        ) : ledger.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            No transactions recorded yet. Complete quests to record rewards!
          </p>
        ) : (
          <div className="divide-y divide-surface-border overflow-hidden">
            {ledger.map((entry) => {
              const isPositive = entry.amount > 0;
              return (
                <div
                  key={entry.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-xl border ${
                        isPositive
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200">{entry.description}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {new Date(entry.created_at).toLocaleString()} • {entry.entry_type}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`font-serif font-bold text-sm flex items-center space-x-1 ${
                      isPositive ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    <span>
                      {isPositive ? `+${entry.amount}` : entry.amount}
                    </span>
                    <Coins className="w-3.5 h-3.5 ml-0.5" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
