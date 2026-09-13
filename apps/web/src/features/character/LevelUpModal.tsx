import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { getRankTitle } from '../../lib/rpg';
import { sound } from '../../lib/sound';
import { Crown, Sparkles, ArrowRight, Award } from 'lucide-react';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  oldLevel: number;
  newLevel: number;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  oldLevel,
  newLevel,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Play audio fanfare
      sound.playLevelUp();

      // Check prefers-reduced-motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        // Fire confetti celebration
        const count = 200;
        const defaults = {
          origin: { y: 0.7 },
          zIndex: 9999,
        };

        confetti({
          ...defaults,
          particleCount: Math.floor(count * 0.5),
          spread: 60,
          colors: ['#6ee7f9', '#f6c453', '#78e6a0'],
        });
        confetti({
          ...defaults,
          particleCount: Math.floor(count * 0.3),
          spread: 100,
          decay: 0.91,
          scalar: 0.8,
          colors: ['#f6c453', '#ffffff', '#c084fc'],
        });
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const oldRank = getRankTitle(oldLevel);
  const newRank = getRankTitle(newLevel);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Level Up Celebration" maxWidth="md">
      <div className="text-center py-4 space-y-6">
        {/* Crown Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border-2 border-amber-400/40 text-amber-400 flex items-center justify-center shadow-gold-glow animate-bounce">
            <Crown className="w-10 h-10 fill-amber-400/20" />
          </div>
          <Sparkles className="w-6 h-6 text-cyan-300 absolute -top-2 -right-2 animate-spin-slow" />
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest font-mono text-cyan-300 block mb-1">
            New Rank Unlocked
          </span>
          <h2 className="font-serif text-3xl font-extrabold text-slate-100">
            {newRank.title}
          </h2>
          <p className="text-xs text-slate-400 mt-1">{newRank.subtitle}</p>
        </div>

        {/* Level Transition Pill */}
        <div className="flex items-center justify-center space-x-4 bg-surface-card p-4 rounded-2xl border border-surface-border">
          <div className="text-center">
            <p className="text-[10px] uppercase text-slate-500 font-semibold">Previous</p>
            <p className="text-xl font-bold font-serif text-slate-400">Level {oldLevel}</p>
          </div>

          <ArrowRight className="w-5 h-5 text-amber-400" />

          <div className="text-center">
            <p className="text-[10px] uppercase text-amber-400 font-semibold">Ascended</p>
            <p className="text-2xl font-extrabold font-serif text-cyan-300">Level {newLevel}</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
          Your daily dedication has borne fruit. Guild merchants acknowledge your growing renown with higher status in the hall!
        </p>

        <div className="pt-2">
          <Button onClick={onClose} variant="gold" size="lg" className="w-full">
            <Award className="w-4 h-4 mr-2" />
            <span>Claim Glory & Continue</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
