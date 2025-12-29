"use client";

import React from "react";

interface MinimalProjectCardProps {
  id: string;
  title: string;
  description: string;
  tags: string[];
  views: number;
  onViewDetails?: () => void;
}

export const MinimalProjectCard: React.FC<MinimalProjectCardProps> = ({
  title,
  description,
  tags,
  views,
  onViewDetails,
}) => {
  return (
    <article className="project-card">
      <h3 className="project-title">{title}</h3>
      <p className="project-description line-clamp-2">{description}</p>

      {/* Tech Tags */}
      <div className="flex flex-wrap">
        {tags.slice(0, 4).map((tag) => (
          <span key={tag} className="project-tag">
            {tag}
          </span>
        ))}
      </div>

      {/* Meta: Views + Link */}
      <div className="project-meta">
        <span className="project-views">{views.toLocaleString()} views</span>
        <button
          onClick={onViewDetails}
          className="project-link"
          aria-label={`View details of ${title}`}
        >
          View details →
        </button>
      </div>
    </article>
  );
};
