import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { calculateLevelFromTotalXp, getRankTitle } from '../../lib/rpg';
import { ProgressBar } from '../../components/ProgressBar';
import { Shield, Sparkles, Award, Zap } from 'lucide-react';

export const HeroCard: React.FC = () => {
  const { profile, equippedBadge, equippedFrame } = useAuth();

  const totalXp = profile?.xp || 0;
  const levelInfo = calculateLevelFromTotalXp(totalXp);
  const rank = getRankTitle(levelInfo.level);

  // Avatar frame styling
  const frameBorder = equippedFrame?.metadata?.borderColor || '#6ee7f9';
  const frameGlow = equippedFrame?.metadata?.glow || '0 0 12px rgba(110, 231, 249, 0.4)';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-surface via-surface/95 to-surface-card border border-surface-border p-5 sm:p-6 shadow-2xl">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {/* Avatar with Frame */}
        <div className="relative shrink-0">
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center bg-surface-light text-cyan-300 font-serif text-3xl font-bold shadow-lg transition duration-300 hover:scale-105"
            style={{
              border: `2px solid ${frameBorder}`,
              boxShadow: frameGlow,
            }}
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Adventurer avatar"
                className="w-full h-full rounded-2xl object-cover"
              />
            ) : (
              <span>{profile?.display_name?.charAt(0) || 'A'}</span>
            )}
          </div>

          {/* Level Badge Pip */}
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-extrabold text-xs px-2.5 py-0.5 rounded-full border border-cyan-200 shadow-md">
            Lv. {levelInfo.level}
          </div>
        </div>

        {/* Hero Details */}
        <div className="flex-1 text-center sm:text-left space-y-3 w-full">
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="font-serif text-2xl font-bold text-slate-100 tracking-wide">
                {profile?.display_name || 'Guild Adventurer'}
              </h1>

              {/* Equipped Badge Tag */}
              {equippedBadge && (
                <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  <Award className="w-3 h-3 text-amber-400" />
                  <span>{equippedBadge.name}</span>
                </span>
              )}
            </div>

            <p className="text-xs text-cyan-300/90 font-serif tracking-widest uppercase mt-0.5">
              {rank.title} — {rank.subtitle}
            </p>
          </div>

          {/* Essence (XP) Gauge */}
          <div className="space-y-1">
            <ProgressBar
              current={levelInfo.currentLevelXp}
              max={levelInfo.requiredXpForNext}
              color="cyan"
              label="Essence Progress"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span className="flex items-center space-x-1">
                <Zap className="w-3 h-3 text-cyan-400" />
                <span>Total Accumulated: {totalXp} XP</span>
              </span>
              <span>
                {levelInfo.requiredXpForNext - levelInfo.currentLevelXp} XP to Level {levelInfo.level + 1}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
