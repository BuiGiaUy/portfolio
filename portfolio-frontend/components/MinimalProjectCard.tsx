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

  const handleDetailsClick = () => {
    if (slug) {
      router.push(`/projects/${slug}`);
    }
    onViewDetails?.();
  };

  return (
    <article className="project-card">
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
            >
              Demo
            </a>
          )}
          <button
            onClick={handleDetailsClick}
            className="project-link"
            aria-label={`View details of ${title}`}
          >
            Details →
          </button>
        </div>
      </div>
    </article>
  );
};
