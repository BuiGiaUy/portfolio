"use client";

import React from "react";
import { MinimalProjectCard } from "./MinimalProjectCard";
import { MinimalSkeletonCard } from "./MinimalSkeletonCard";
import { useLanguage } from "./LanguageProvider";
import { translations } from "@/lib/translations";
import type { Project } from "@/types/project";

interface ProjectsGridProps {
  projects: Project[];
  isLoading: boolean;
  skeletonCount?: number;
  onProjectView?: (project: Project) => void;
}

export const ProjectsGrid: React.FC<ProjectsGridProps> = ({
  projects,
  isLoading,
  skeletonCount = 6,
  onProjectView,
}) => {
  const { language } = useLanguage();
  const t = translations[language];

  // Loading State
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <MinimalSkeletonCard key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  // Empty State
  if (projects.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted text-lg">{t.projects.empty}</p>
        <p className="text-muted text-sm mt-2">{t.projects.emptySubtitle}</p>
      </div>
    );
  }

  // Projects Grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <MinimalProjectCard
          key={project.id}
          id={project.id}
          title={project.title}
          shortDescription={project.shortDescription}
          techStack={project.techStack}
          views={project.views}
          slug={project.slug}
          githubUrl={project.githubUrl}
          demoUrl={project.demoUrl}
          onViewDetails={() => onProjectView?.(project)}
        />
      ))}
    </div>
  );
};
