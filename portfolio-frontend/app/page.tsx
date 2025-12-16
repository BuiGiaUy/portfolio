"use client";

import React, { useCallback } from "react";
import { ProjectList } from "@/components";
import { useProjects } from "@/services/project.service";
import type { Project } from "@/types/project";

export default function Home() {
  const { projects, isLoading, error, refetch } = useProjects();

  const handleProjectView = useCallback((project: Project) => {
    console.log(`Viewing project: ${project.id} - ${project.title}`);
    // Navigate to project detail or open modal
    // router.push(`/projects/${project.id}`);
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900">
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
              onClick={handleRefresh}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900">
      {/* Hero Header */}
      <header className="relative overflow-hidden border-b border-gray-200/50 bg-white/80 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/80">
        {/* Decorative gradient blobs */}
        <div
          className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-400/20 to-pink-500/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative container mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="flex flex-col items-center text-center lg:flex-row lg:items-start lg:justify-between lg:text-left">
            <div className="mb-8 lg:mb-0 lg:max-w-2xl">
              {/* Animated badge */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                </span>
                Available for freelance work
              </div>

              <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Creative Developer
                </span>
                <br />
                Portfolio
              </h1>

              <p className="max-w-xl text-lg leading-relaxed text-gray-600 dark:text-gray-400 sm:text-xl">
                Crafting exceptional digital experiences with modern
                technologies. Explore my latest projects and see how I bring
                ideas to life.
              </p>

              {/* Stats */}
              <div className="mt-8 flex flex-wrap justify-center gap-8 lg:justify-start">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {isLoading ? "..." : projects.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Projects
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {isLoading
                      ? "..."
                      : projects
                          .reduce((sum, p) => sum + p.views, 0)
                          .toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total Views
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                    5+
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Years
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                aria-label="Refresh projects"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-900"
              >
                <span
                  className={`transition-transform duration-300 ${
                    isLoading ? "animate-spin" : "group-hover:rotate-180"
                  }`}
                >
                  ⟳
                </span>
                {isLoading ? "Refreshing..." : "Refresh Projects"}
              </button>

              <a
                href="#projects"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white/50 px-8 py-4 font-semibold text-gray-700 backdrop-blur-sm transition-all duration-300 hover:border-indigo-300 hover:bg-white hover:text-indigo-600 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
              >
                View All Projects
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Projects Section */}
      <main id="projects" className="scroll-mt-20">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Featured Projects
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
              Here are some of my recent projects. Each one represents a unique
              challenge and showcases different aspects of my skills and
              expertise.
            </p>
          </div>
        </div>

        <ProjectList
          projects={projects}
          isLoading={isLoading}
          skeletonCount={6}
          emptyMessage="No projects available at the moment."
          onProjectView={handleProjectView}
        />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200/50 bg-white/80 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                Portfolio
              </span>
            </div>

            <div className="flex items-center gap-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                GitHub
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                LinkedIn
              </a>
              <a
                href="mailto:hello@example.com"
                className="text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Contact
              </a>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Built with Next.js, TypeScript & Tailwind CSS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
