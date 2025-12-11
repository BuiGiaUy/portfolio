'use client';

import React, { useState, useCallback } from 'react';
import { ProjectList } from '@/components/ProjectList';
import { mockProjects } from '@/mock/projects';
import type { Project } from '@/types/project';

/**
 * Simple Example: Direct Mock Usage
 * 
 * This is the simplest way to use mock data.
 * Good for quick prototyping and testing.
 * 
 * Note: For production, use the service layer approach instead
 * (see /app/projects-example/page.tsx)
 */
export default function SimpleProjectPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Simulate initial loading
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Get all unique tags from projects
  const allTags = Array.from(
    new Set(mockProjects.flatMap((project) => project.tags))
  ).sort();

  // Filter projects by selected tags
  const filteredProjects: Project[] = selectedTags.length > 0
    ? mockProjects.filter((project) =>
        selectedTags.some((tag) => project.tags.includes(tag))
      )
    : mockProjects;

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  const handleProjectView = useCallback((project: Project) => {
    console.log('Project viewed:', project);
    alert(
      `${project.title}\n\n` +
      `${project.description}\n\n` +
      `Views: ${project.views.toLocaleString()}\n` +
      `Technologies: ${project.tags.join(', ')}`
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Stats */}
      <header className="bg-white shadow dark:bg-gray-800">
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Portfolio Projects
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>📂 {mockProjects.length} Projects</span>
            <span>
              👁️ {mockProjects.reduce((sum, p) => sum + p.views, 0).toLocaleString()} Total Views
            </span>
            <span>
              🏷️ {allTags.length} Technologies
            </span>
          </div>
        </div>
      </header>

      {/* Tag Filter */}
      <div className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur dark:border-gray-700 dark:bg-gray-800/95">
        <div className="container mx-auto px-4 py-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Filter by Technology
            </h2>
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              const count = mockProjects.filter((p) =>
                p.tags.includes(tag)
              ).length;

              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {tag} ({count})
                </button>
              );
            })}
          </div>
          {selectedTags.length > 0 && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredProjects.length} of {mockProjects.length} projects
            </p>
          )}
        </div>
      </div>

      {/* Project List */}
      <ProjectList
        projects={filteredProjects}
        isLoading={isLoading}
        skeletonCount={10}
        emptyMessage={
          selectedTags.length > 0
            ? `No projects found with: ${selectedTags.join(', ')}`
            : 'No projects available'
        }
        onProjectView={handleProjectView}
      />
    </div>
  );
}
