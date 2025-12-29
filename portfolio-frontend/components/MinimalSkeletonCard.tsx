"use client";

import React from "react";

interface MinimalSkeletonCardProps {
  className?: string;
}

export const MinimalSkeletonCard: React.FC<MinimalSkeletonCardProps> = ({
  className = "",
}) => {
  return (
    <article
      className={`project-card ${className}`}
      aria-label="Loading project"
      aria-busy="true"
    >
      {/* Skeleton Title */}
      <div className="skeleton h-5 w-3/4 mb-3" style={{ borderRadius: 0 }} />

      {/* Skeleton Description */}
      <div className="space-y-2 mb-4">
        <div className="skeleton h-4 w-full" style={{ borderRadius: 0 }} />
        <div className="skeleton h-4 w-5/6" style={{ borderRadius: 0 }} />
      </div>

      {/* Skeleton Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="skeleton h-6 w-16" style={{ borderRadius: 0 }} />
        <div className="skeleton h-6 w-20" style={{ borderRadius: 0 }} />
        <div className="skeleton h-6 w-14" style={{ borderRadius: 0 }} />
      </div>

      {/* Skeleton Meta */}
      <div
        className="flex items-center justify-between pt-4"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <div className="skeleton h-4 w-16" style={{ borderRadius: 0 }} />
        <div className="skeleton h-4 w-20" style={{ borderRadius: 0 }} />
      </div>
    </article>
  );
};
