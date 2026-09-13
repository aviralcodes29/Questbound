import React, { useState } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { Shield, Flame, Coins, Volume2, VolumeX, LogOut, User, Sparkles } from 'lucide-react';
import { sound } from '../lib/sound';

interface TopBarProps {
  onOpenProfile?: () => void;
}

export const TopBar: React.FC<TopBarProps> = () => {
  const { profile, signOut, isDemoMode } = useAuth();
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [menuOpen, setMenuOpen] = useState(false);

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      sound.playClick();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-surface/90 backdrop-blur-md border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-moonlit">
            <Shield className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <span className="font-serif text-lg font-bold tracking-wide text-slate-100 block leading-tight">
              QUESTBOUND
            </span>
            <span className="text-[10px] text-cyan-400/80 uppercase tracking-widest font-mono">
              Moonlit Guild Hall
            </span>
          </div>
        </div>

        {/* Badges & Stats */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* Streak Flame */}
          <div
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-surface-card border border-amber-500/30 text-amber-400 shadow-sm"
            title="Current Streak in days"
          >
            <Flame className="w-4 h-4 text-amber-400 animate-pulse fill-amber-400/30" />
            <span className="font-bold text-xs tracking-wider">
              {profile?.current_streak || 0}
            </span>
            <span className="text-[10px] uppercase text-amber-400/70 hidden sm:inline">
              Days
            </span>
          </div>

          {/* Gold Counter */}
          <div
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-surface-card border border-amber-400/40 text-amber-300 shadow-gold-glow"
            title="Available Guild Gold"
          >
            <Coins className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            <span className="font-bold text-xs tracking-wider">
              {profile?.gold ?? 0}
            </span>
            <span className="text-[10px] uppercase text-amber-300/70 hidden sm:inline">
              Gold
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleMute}
            aria-label={isMuted ? 'Unmute game audio' : 'Mute game audio'}
            className="p-2 rounded-xl bg-surface-card border border-surface-border text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Profile Menu Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMenuOpen(!menuOpen);
              }}
              aria-label="User menu"
              aria-expanded={menuOpen}
              className="flex items-center space-x-2 p-1.5 pl-2 rounded-xl bg-surface-card border border-surface-border hover:border-cyan-500/40 transition"
            >
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-serif text-xs font-bold">
                {profile?.display_name?.charAt(0) || 'A'}
              </div>
              <span className="text-xs font-medium text-slate-300 hidden md:inline max-w-[100px] truncate">
                {profile?.display_name || 'Adventurer'}
              </span>
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface border border-surface-border rounded-xl shadow-2xl p-2 z-50 animate-scaleUp">
                <div className="px-3 py-2 border-b border-surface-border mb-1">
                  <p className="text-xs font-bold text-slate-200">
                    {profile?.display_name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    Level {profile?.level} Adventurer
                  </p>
                  {isDemoMode && (
                    <span className="inline-flex items-center space-x-1 mt-1 text-[9px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Demo Mode</span>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setMenuOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-coral hover:bg-coral/10 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Leave Guild (Sign Out)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
