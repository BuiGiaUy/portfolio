"use client";

import React from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const handleCardClick = () => {
    if (slug) {
      router.push(`/projects/${slug}`);
    }
    onViewDetails?.();
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    // Prevent card click when clicking on links
    e.stopPropagation();
  };

  return (
    <article
      className="project-card cursor-pointer"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
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
        <span className="project-views">{views.toLocaleString()} views</span>
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
    </article>
  );
};
