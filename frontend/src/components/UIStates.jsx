import React from 'react';

export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />
);

export const SkeletonCard = () => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
    <Skeleton className="h-6 w-3/4 mb-3" />
    <Skeleton className="h-4 w-1/2 mb-5" />
    <Skeleton className="h-10 w-full rounded-xl" />
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="rounded-3xl border border-red-100 bg-red-50/50 p-8 text-center max-w-lg mx-auto">
    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-500">
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-red-900 mb-2">Connection Error</h3>
    <p className="text-sm text-red-700 mb-6">{message || 'Unable to connect to the salon service. Please try again.'}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 shadow-sm"
      >
        Try Again
      </button>
    )}
  </div>
);
