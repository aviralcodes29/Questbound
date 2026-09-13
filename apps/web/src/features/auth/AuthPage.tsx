import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { authSchema } from '../../lib/validation';
import { Shield, Sparkles, Wand2, KeyRound, Mail, User, AlertCircle } from 'lucide-react';
import { sound } from '../../lib/sound';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, enterDemoMode } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    sound.playClick();

    // Validate with Zod
    const result = authSchema.safeParse({
      email,
      password,
      displayName: mode === 'signup' ? displayName : undefined,
    });

    if (!result.success) {
      setErrorMsg(result.error.errors[0].message);
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password, displayName);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoAccess = () => {
    sound.playClick();
    enterDemoMode();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md bg-surface/90 backdrop-blur-md border border-surface-border rounded-2xl shadow-card p-6 sm:p-8 z-10">
        {/* Guild Seal Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-4 shadow-moonlit">
            <Shield className="w-8 h-8 text-cyan-300 animate-pulse-slow" />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-wide text-slate-100">
            QUESTBOUND
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-sans">
            The Moonlit Guild Hall for Real-Life Adventurers
          </p>
        </div>

        {/* Demo Fast Track Banner */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-surface-light to-cyan-500/10 border border-amber-500/30 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                  Instant Evaluator Access
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  Explore full features immediately without creating an account
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDemoAccess}
            className="mt-3 w-full py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs tracking-wider uppercase transition flex items-center justify-center space-x-2 shadow-gold-glow"
          >
            <Wand2 className="w-4 h-4" />
            <span>Enter Guild As Demo Adventurer</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-surface-border w-full"></div>
          <span className="bg-surface px-3 text-xs uppercase tracking-widest text-slate-500 font-serif">
            or authenticate
          </span>
          <div className="border-t border-surface-border w-full"></div>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-lg bg-surface-card p-1 mb-6 border border-surface-border">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
              sound.playClick();
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition tracking-wider uppercase ${
              mode === 'login'
                ? 'bg-surface-light text-cyan-300 shadow-sm border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
              sound.playClick();
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition tracking-wider uppercase ${
              mode === 'signup'
                ? 'bg-surface-light text-cyan-300 shadow-sm border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 p-3 rounded-lg bg-coral/10 border border-coral/30 text-coral text-xs flex items-center space-x-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Adventurer Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Elyndor the Swift"
                  className="w-full pl-9 pr-3 py-2 bg-surface-card border border-surface-border rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Scroll of Contact (Email)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="adventurer@guild.realm"
                className="w-full pl-9 pr-3 py-2 bg-surface-card border border-surface-border rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Secret Rune (Password)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-surface-card border border-surface-border rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-6 py-2.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm tracking-wider uppercase transition shadow-moonlit disabled:opacity-50"
          >
            {submitting ? 'Inscribing Rune...' : mode === 'login' ? 'Open Guild Doors' : 'Inscribe My Name'}
          </button>
        </form>
      </div>
    </div>
  );
};
