'use client';

import React from 'react';

interface SkeletonCardProps {
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '' }) => {
  return (
    <article 
      className={`flex flex-col overflow-hidden rounded-2xl bg-white shadow-md dark:bg-gray-800 ${className}`}
      aria-label="Loading project"
      aria-busy="true"
    >
      {/* Skeleton Image Section */}
      <div className="relative h-48 w-full overflow-hidden sm:h-56 md:h-64">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
        {/* Pulsing Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-400/40 to-transparent" />
        
        {/* Skeleton title placeholder */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <div className="h-8 w-2/3 animate-pulse rounded-md bg-white/30" />
          <div className="mt-2 h-6 w-20 animate-pulse rounded-full bg-white/20" />
        </div>
      </div>

      {/* Skeleton Content Section */}
      <div className="flex flex-1 flex-col p-4 sm:p-6">
        {/* Skeleton Description Lines */}
        <div className="mb-4 flex-1 space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
          <div className="h-4 w-4/6 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
        </div>

        {/* Skeleton Tags */}
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="h-7 w-16 animate-pulse rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
          <div className="h-7 w-20 animate-pulse rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
          <div className="h-7 w-14 animate-pulse rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
        </div>

        {/* Skeleton Button */}
        <div className="h-12 w-full animate-pulse rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
      </div>
    </article>
  );
};
