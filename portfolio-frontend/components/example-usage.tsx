"use client";

import React, { useCallback } from "react";
import { ProjectList } from "./ProjectList";
import { useProjects } from "@/services/project.service";
import type { Project } from "@/types/project";

/**
 * Example Usage Component
 * Demonstrates how to use ProjectList with backend integration
 */
export default function ExampleUsage() {
  const { projects, isLoading, error, refetch } = useProjects();

  const handleProjectView = useCallback((project: Project) => {
    console.log(`Viewing project: ${project.id} - ${project.title}`);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="mx-auto max-w-md">
            <div className="mb-4 text-6xl">⚠️</div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              Error Loading Projects
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              {error.message}
            </p>
            <button
              onClick={refetch}
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl"
            >
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
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                My Projects
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Explore my latest work and creations
              </p>
              {!isLoading && projects.length > 0 && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                  {projects.length} projects •{" "}
                  {projects.reduce((s, p) => s + p.views, 0).toLocaleString()}{" "}
                  views
                </p>
              )}
            </div>
            <button
              onClick={refetch}
              disabled={isLoading}
              className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-800"
            >
              {isLoading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      {/* Project List */}
      <main>
        <ProjectList
          projects={projects}
          isLoading={isLoading}
          skeletonCount={6}
          emptyMessage="No projects available"
          onProjectView={handleProjectView}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-6 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Built with Next.js, TypeScript, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}
