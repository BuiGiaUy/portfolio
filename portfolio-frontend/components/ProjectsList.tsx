"use client";

import { useProjects, useProjectView } from "@/lib/query";
import { useState } from "react";

/**
 * Project Card Component
 * Displays individual project with optimistic view counting
 */
function ProjectCard({ project }: { project: any }) {
  const { viewCount, incrementView, isIncrementing } = useProjectView(
    project.id
  );
  const [hasViewed, setHasViewed] = useState(false);

  const handleView = () => {
    if (!hasViewed) {
      incrementView("optimistic");
      setHasViewed(true);
    }
  };

  return (
    <div
      className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleView}
    >
      <h3 className="text-xl font-bold mb-2">{project.title}</h3>
      <p className="text-gray-600 mb-4">{project.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {project.tags?.map((tag: string, idx: number) => (
            <span
              key={idx}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <svg
            className={`w-5 h-5 ${isIncrementing ? "animate-pulse" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <span className="text-sm text-gray-600">{viewCount}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Projects List Component
 * Uses React Query to fetch and display projects from real API
 */
export function ProjectsList() {
  const { data: projects, isLoading, error, refetch } = useProjects();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">
            Failed to load projects
          </h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">No projects found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">Projects</h2>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 border rounded hover:bg-gray-50 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
