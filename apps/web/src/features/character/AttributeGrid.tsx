import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { Brain, Dumbbell, BookOpen, Sparkles } from 'lucide-react';

export const AttributeGrid: React.FC = () => {
  const { attributes } = useAuth();

  const attributeList = [
    {
      name: 'Intellect',
      value: attributes?.intellect ?? 1,
      source: 'Study & Coding',
      icon: Brain,
      color: 'text-cyan-300',
      bg: 'bg-cyan-500/10 border-cyan-500/30',
      description: 'Sharpened through algorithmic problem-solving and deep technical learning.',
    },
    {
      name: 'Strength',
      value: attributes?.strength ?? 1,
      source: 'Gym & Physical Health',
      icon: Dumbbell,
      color: 'text-emerald-300',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      description: 'Built through workouts, cardiovascular conditioning, and healthy rest.',
    },
    {
      name: 'Wisdom',
      value: attributes?.wisdom ?? 1,
      source: 'Reading & Mindfulness',
      icon: BookOpen,
      color: 'text-amber-300',
      bg: 'bg-amber-500/10 border-amber-500/30',
      description: 'Gained by digesting literature, meditation, and thoughtful introspection.',
    },
    {
      name: 'Charisma',
      value: attributes?.charisma ?? 1,
      source: 'Social & Creative Pursuits',
      icon: Sparkles,
      color: 'text-pink-300',
      bg: 'bg-pink-500/10 border-pink-500/30',
      description: 'Radiated through creative arts, communication, and community bonding.',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-bold text-slate-100">
          Core Attributes
        </h2>
        <span className="text-[11px] text-slate-400">Gained via Daily Deeds</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {attributeList.map((attr) => {
          const Icon = attr.icon;
          return (
            <div
              key={attr.name}
              className="p-3.5 rounded-2xl bg-surface border border-surface-border hover:border-slate-600 transition flex flex-col justify-between space-y-2 shadow-card"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl border ${attr.bg}`}>
                  <Icon className={`w-4 h-4 ${attr.color}`} />
                </div>
                <span className="font-serif text-xl font-bold text-slate-100">
                  {attr.value}
                </span>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-200">{attr.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{attr.source}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
