'use client';

import React from 'react';
import { ProjectCard, ProjectCardProps } from './ProjectCard';
import { SkeletonCard } from './SkeletonCard';
import type { Project } from '@/types/project';

export interface ProjectListProps {
  projects: Project[];
  isLoading?: boolean;
  skeletonCount?: number;
  emptyMessage?: string;
  onProjectView?: (project: Project) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  isLoading = false,
  skeletonCount = 6,
  emptyMessage = 'No projects found.',
  onProjectView,
}) => {
  // Show skeleton loading state
  if (isLoading) {
    return (
      <section 
        className="container mx-auto px-4 py-8 sm:px-6 lg:px-8"
        aria-label="Loading projects"
        aria-busy="true"
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <SkeletonCard key={`skeleton-${index}`} />
          ))}
        </div>
      </section>
    );
  }

  // Show empty state
  if (!projects || projects.length === 0) {
    return (
      <section 
        className="container mx-auto px-4 py-16 text-center sm:px-6 lg:px-8"
        aria-label="Empty state"
      >
        <div className="mx-auto max-w-md">
          {/* Empty state illustration */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="h-12 w-12 text-indigo-500 dark:text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
            </div>
          </div>

          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            {emptyMessage}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Check back later for exciting projects!
          </p>

          {/* Decorative dots */}
          <div className="mt-8 flex justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-300 dark:bg-indigo-600" />
            <span className="h-2 w-2 rounded-full bg-purple-300 dark:bg-purple-600" />
            <span className="h-2 w-2 rounded-full bg-pink-300 dark:bg-pink-600" />
          </div>
        </div>
      </section>
    );
  }

  // Show project grid
  return (
    <section 
      className="container mx-auto px-4 py-8 sm:px-6 lg:px-8"
      aria-label="Projects list"
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            id={project.id}
            title={project.title}
            description={project.description}
            imageUrl={project.imageUrl}
            tags={project.tags}
            views={project.views}
            onView={() => onProjectView?.(project)}
          />
        ))}
      </div>
    </section>
  );
};
