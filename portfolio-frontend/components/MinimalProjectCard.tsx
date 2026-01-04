"use client";

import React from "react";
import Link from "next/link";

interface MinimalProjectCardProps {
  id: string;
  title: string;
  shortDescription: string;
  techStack: string[];
  views?: number;
  slug?: string;
  githubUrl?: string;
  demoUrl?: string;
  onViewDetails?: () => void;
}

export const MinimalProjectCard: React.FC<MinimalProjectCardProps> = ({
  title,
  shortDescription,
  techStack,
  views = 0,
  slug,
  githubUrl,
  demoUrl,
  onViewDetails,
}) => {
  const handleLinkClick = (e: React.MouseEvent) => {
    // Prevent card click when clicking on external links
    e.stopPropagation();
  };

  const cardContent = (
    <>
      <h3 className="project-title">{title}</h3>
      <p className="project-description line-clamp-2">{shortDescription}</p>

      {/* Tech Stack Tags */}
      <div className="flex flex-wrap">
        {techStack.slice(0, 4).map((tech) => (
          <span key={tech} className="project-tag">
            {tech}
          </span>
        ))}
      </div>

      {/* Meta: Views + Links */}
      <div className="project-meta">
        <span data-testid="view-count" className="project-views">
          {views.toLocaleString()} views
        </span>
        <div className="flex gap-2">
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="project-link"
              aria-label="View GitHub repository"
              onClick={handleLinkClick}
            >
              GitHub
            </a>
          )}
          {demoUrl && (
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="project-link"
              aria-label="View live demo"
              onClick={handleLinkClick}
            >
              Demo
            </a>
          )}
        </div>
      </div>
    </>
  );

  if (!slug) {
    return (
      <article data-testid="project-card" className="project-card">
        {cardContent}
      </article>
    );
  }

  return (
    <Link
      href={`/projects/${slug}`}
      data-testid="project-card"
      className="project-card cursor-pointer"
      onClick={() => onViewDetails?.()}
    >
      {cardContent}
    </Link>
  );
};
