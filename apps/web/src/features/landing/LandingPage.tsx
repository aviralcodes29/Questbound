import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../../components/Button';
import { sound } from '../../lib/sound';
import {
  Shield,
  Sparkles,
  Zap,
  Scroll,
  ArrowRight,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, enterDemoMode } = useAuth();

  const handleEnter = () => {
    sound.playClick();
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const handleQuickDemo = () => {
    sound.playClick();
    enterDemoMode();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 selection:bg-cyan-500 selection:text-slate-900 overflow-hidden relative flex flex-col justify-between">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-moonlit">
            <Shield className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <span className="font-serif text-lg font-bold tracking-wide text-slate-100 block">
              QUESTBOUND
            </span>
            <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-mono">
              Life RPG
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button onClick={handleQuickDemo} variant="secondary" size="sm">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400" />
            <span>Instant Demo</span>
          </Button>
          <Button onClick={handleEnter} variant="primary" size="sm">
            <span>{user ? 'Open Dashboard' : 'Join Guild'}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 py-12 sm:py-20 text-center relative z-10 space-y-6">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider shadow-moonlit">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Moonlit Guild Hall • Fantasy Productivity</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 leading-tight">
          Turn Everyday Habits Into{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-300">
            Legendary Quests
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Slay procrastination, conquer coding sprints, forge morning workouts, and ascend through ranks. Earn Essence, stack Guild Gold, and unlock prestigious cosmetics.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button onClick={handleEnter} variant="primary" size="lg" className="w-full sm:w-auto shadow-moonlit">
            <Scroll className="w-4 h-4 mr-2" />
            <span>Enter the Guild Hall</span>
          </Button>
          <Button onClick={handleQuickDemo} variant="gold" size="lg" className="w-full sm:w-auto shadow-gold-glow">
            <Zap className="w-4 h-4 mr-2" />
            <span>Instant Evaluator Demo</span>
          </Button>
        </div>

        {/* Highlight Stats */}
        <div className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center border-t border-surface-border">
          <div className="p-4 rounded-2xl bg-surface/50 border border-surface-border">
            <p className="font-serif text-2xl font-bold text-cyan-300">Essence</p>
            <p className="text-xs text-slate-400 mt-1">Non-Linear Leveling</p>
          </div>
          <div className="p-4 rounded-2xl bg-surface/50 border border-surface-border">
            <p className="font-serif text-2xl font-bold text-amber-400">Guild Gold</p>
            <p className="text-xs text-slate-400 mt-1">Cosmetic Emporium</p>
          </div>
          <div className="p-4 rounded-2xl bg-surface/50 border border-surface-border">
            <p className="font-serif text-2xl font-bold text-emerald-400">Attributes</p>
            <p className="text-xs text-slate-400 mt-1">Real-Life Progression</p>
          </div>
          <div className="p-4 rounded-2xl bg-surface/50 border border-surface-border">
            <p className="font-serif text-2xl font-bold text-purple-400">PostgreSQL</p>
            <p className="text-xs text-slate-400 mt-1">Row Level Security</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-8 border-t border-surface-border text-center sm:flex sm:justify-between text-xs text-slate-500 relative z-10">
        <p>© 2026 Questbound — Crafted for Habit Masters & RPG Enthusiasts</p>
        <p className="mt-2 sm:mt-0 font-mono">Row Level Security • Zod Schemas • Moonlit Theme</p>
      </footer>
    </div>
  );
};
