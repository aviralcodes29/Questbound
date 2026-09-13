import React from 'react';
import { sound } from '../lib/sound';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'mint' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  onClick,
  className = '',
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !isLoading) {
      sound.playClick();
      onClick?.(e);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }[size];

  const variantClasses = {
    primary:
      'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-moonlit border border-cyan-400/40',
    secondary:
      'bg-surface-light hover:bg-surface-highlight text-slate-200 border border-surface-border',
    gold:
      'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold shadow-gold-glow border border-amber-300/50',
    mint:
      'bg-mint hover:bg-emerald-400 text-slate-950 font-bold shadow-mint-glow border border-mint/40',
    danger:
      'bg-coral/20 hover:bg-coral/30 text-coral border border-coral/40 font-semibold',
    ghost:
      'hover:bg-surface-light text-slate-400 hover:text-slate-100',
  }[variant];

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={`inline-flex items-center justify-center rounded-xl transition duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 focus-visible:ring-2 focus-visible:ring-cyan-400 ${sizeClasses} ${variantClasses} ${className}`}
    >
      {isLoading ? (
        <span className="inline-flex items-center space-x-2">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          <span>Forging...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
