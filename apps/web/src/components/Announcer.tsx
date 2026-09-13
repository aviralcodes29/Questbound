import React, { createContext, useContext, useState, useCallback } from 'react';

interface AnnouncerContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  toast: (message: string, type?: 'success' | 'error' | 'info' | 'gold') => void;
}

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'gold';
}

const AnnouncerContext = createContext<AnnouncerContextType | undefined>(undefined);

export const AnnouncerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [liveMessage, setLiveMessage] = useState<string>('');
  const [ariaPriority, setAriaPriority] = useState<'polite' | 'assertive'>('polite');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAriaPriority(priority);
    setLiveMessage(message);
    // Clear after announcement to allow repeated messages
    setTimeout(() => setLiveMessage(''), 3000);
  }, []);

  const toast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'gold' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    announce(message, type === 'error' ? 'assertive' : 'polite');

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, [announce]);

  return (
    <AnnouncerContext.Provider value={{ announce, toast }}>
      {children}

      {/* Screen Reader ARIA Live Region */}
      <div
        role="status"
        aria-live={ariaPriority}
        aria-atomic="true"
        className="sr-only"
      >
        {liveMessage}
      </div>

      {/* Visual Floating Toasts */}
      <div
        className="fixed bottom-20 sm:bottom-6 right-6 z-50 flex flex-col space-y-2 pointer-events-none"
        aria-hidden="true"
      >
        {toasts.map((t) => {
          const borderClass = {
            success: 'border-mint text-mint bg-surface-card/95',
            error: 'border-coral text-coral bg-surface-card/95',
            gold: 'border-amber-400 text-amber-300 bg-surface-card/95',
            info: 'border-cyan-400 text-cyan-300 bg-surface-card/95',
          }[t.type];

          return (
            <div
              key={t.id}
              className={`pointer-events-auto px-4 py-2.5 rounded-xl border shadow-xl backdrop-blur-md text-xs font-semibold flex items-center space-x-2 transition-all transform animate-slideUp ${borderClass}`}
            >
              <span>{t.message}</span>
            </div>
          );
        })}
      </div>
    </AnnouncerContext.Provider>
  );
};

export const useAnnounce = () => {
  const context = useContext(AnnouncerContext);
  if (!context) {
    throw new Error('useAnnounce must be used within an AnnouncerProvider');
  }
  return context;
};
