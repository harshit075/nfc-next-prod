import React from 'react';

/**
 * Reusable full-screen loading skeleton fallback.
 * Uses a smooth pulsing effect matching the healthcare UI theme.
 */
export function LoadingSkeleton(): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="w-full max-w-md text-center space-y-4">
        {/* Animated Icon Pulsing */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-health-teal-50 dark:bg-health-teal-950/30 animate-pulse">
          <div className="h-8 w-8 rounded-full bg-health-teal-500 animate-ping opacity-75"></div>
        </div>
        
        {/* Pulsing Text Bars */}
        <div className="space-y-2">
          <div className="mx-auto h-4 w-32 rounded bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
          <div className="mx-auto h-3 w-48 rounded bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default LoadingSkeleton;
