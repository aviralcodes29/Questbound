import React from 'react';

interface ProgressBarProps {
  current: number;
  max: number;
  color?: 'cyan' | 'gold' | 'mint';
  label?: string;
  showText?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  max,
  color = 'cyan',
  label,
  showText = true,
}) => {
  const percent = Math.min(100, Math.max(0, Math.round((current / (max || 1)) * 100)));

  const colorClasses = {
    cyan: 'bg-gradient-to-r from-cyan-500 to-cyan-300 shadow-[0_0_12px_rgba(110,231,249,0.5)]',
    gold: 'bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_12px_rgba(246,196,83,0.5)]',
    mint: 'bg-gradient-to-r from-emerald-500 to-mint shadow-[0_0_12px_rgba(120,230,160,0.5)]',
  }[color];

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center text-xs font-semibold mb-1 text-slate-300">
          <span>{label}</span>
          {showText && <span>{current} / {max} XP ({percent}%)</span>}
        </div>
      )}
      <div
        className="h-2.5 w-full bg-surface-card rounded-full overflow-hidden p-0.5 border border-surface-border relative"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progress bar'}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorClasses}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
