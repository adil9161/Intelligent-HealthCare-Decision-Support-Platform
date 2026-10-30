import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-800/60 dark:bg-slate-800/60 border border-slate-700/30 ${className}`}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-36" />
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 6,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md p-4 space-y-4">
      {/* Header Row */}
      <div className="flex items-center gap-4 pb-3 border-b border-slate-800">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className={`h-4 ${i === 0 ? 'w-36' : 'flex-1'}`} />
        ))}
      </div>
      {/* Data Rows */}
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center gap-4 py-2 border-b border-slate-800/40 last:border-0">
          {Array.from({ length: columns }).map((_, cIdx) => (
            <Skeleton
              key={cIdx}
              className={`h-5 ${cIdx === 0 ? 'w-36' : 'flex-1'} ${rIdx % 2 === 1 ? 'opacity-70' : ''}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const ChartSkeleton: React.FC<{ height?: string }> = ({ height = 'h-64' }) => {
  return (
    <div className={`p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md animate-pulse flex flex-col justify-between ${height}`}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="flex-1 flex items-end gap-2 pt-6">
        {Array.from({ length: 12 }).map((_, i) => {
          const heights = ['h-1/3', 'h-1/2', 'h-2/3', 'h-3/4', 'h-2/5', 'h-4/5', 'h-3/5'];
          return (
            <Skeleton
              key={i}
              className={`flex-1 ${heights[i % heights.length]} rounded-t`}
            />
          );
        })}
      </div>
    </div>
  );
};
