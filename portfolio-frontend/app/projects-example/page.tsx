"use client";

import React, { useCallback } from "react";
import { ProjectList } from "@/components/ProjectList";
import { useProjects } from "@/services/project.service";
import type { Project } from "@/types/project";

/**
 * Projects Page Example
 * Demonstrates backend integration with real API calls
 */
export default function ProjectsExamplePage() {
  const { projects, isLoading, error, refetch } = useProjects();

  const handleProjectView = useCallback((project: Project) => {
    console.log(`Viewing project: ${project.id} - ${project.title}`);
    // Navigate to project detail page or open modal
    // router.push(`/projects/${project.id}`);
  }, []);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="mx-auto max-w-md">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <svg
                  className="h-10 w-10 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              Oops! Something went wrong
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              {error.message}
            </p>
            <button
              onClick={refetch}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold sm:text-5xl md:text-6xl">
            My Portfolio
          </h1>
          <p className="text-lg text-indigo-100 sm:text-xl">
            Explore my latest projects and innovations
          </p>
          {!isLoading && projects.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-indigo-200">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                {projects.length} projects
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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
                {projects.reduce((sum, p) => sum + p.views, 0).toLocaleString()}{" "}
                total views
              </span>
            </div>
          )}

          {/* Refresh button */}
          <button
            onClick={refetch}
            disabled={isLoading}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/20 disabled:opacity-50"
          >
            <svg
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </header>

      {/* Project List */}
      <main>
        <ProjectList
          projects={projects}
          isLoading={isLoading}
          skeletonCount={9}
          emptyMessage="No projects available at the moment"
          onProjectView={handleProjectView}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 dark:border-gray-700 dark:bg-gray-800">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Built with Next.js, TypeScript, and Tailwind CSS • Powered by real
            backend API
          </p>
        </div>
      </footer>
    </div>
  );
}
