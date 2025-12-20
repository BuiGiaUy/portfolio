"use client";

import { ProjectsList } from "@/components/ProjectsList";
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from "@/lib/query";
import { useState } from "react";

/**
 * Projects Page - Full Demo
 * Demonstrates React Query with CRUD operations and optimistic updates
 */
export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProjectTitle.trim()) return;

    try {
      await createProject.mutateAsync({
        title: newProjectTitle,
        description: newProjectDescription,
        tags: ["demo"],
        views: 0,
      });

      // Reset form
      setNewProjectTitle("");
      setNewProjectDescription("");
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateProject.mutateAsync({
        id,
        data: {
          title: "Updated Title",
          description: "This project has been updated!",
        },
      });
    } catch (error) {
      console.error("Failed to update project:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      await deleteProject.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-white">Portfolio Projects</h1>
          <p className="text-gray-300 mt-2">
            Real-time project management with React Query
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Create Project Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">
            Create New Project
          </h2>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Title
              </label>
              <input
                type="text"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                placeholder="Enter project title"
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Enter project description"
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={createProject.isPending || !newProjectTitle.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createProject.isPending ? "Creating..." : "Create Project"}
            </button>

            {createProject.isError && (
              <p className="text-red-400 text-sm">
                Failed to create project. Please try again.
              </p>
            )}
          </form>
        </div>

        {/* Projects List with Actions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">All Projects</h2>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="grid gap-4">
              {projects?.map((project) => (
                <div
                  key={project.id}
                  className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">
                        {project.title}
                      </h3>
                      <p className="text-gray-300 text-sm mt-1">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-400">
                          👁️ {project.views} views
                        </span>
                        {project.tags?.map((tag: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleUpdate(project.id)}
                        disabled={updateProject.isPending}
                        className="px-3 py-1 bg-blue-600/50 hover:bg-blue-600 text-white text-sm rounded transition-colors disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        disabled={deleteProject.isPending}
                        className="px-3 py-1 bg-red-600/50 hover:bg-red-600 text-white text-sm rounded transition-colors disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {(!projects || projects.length === 0) && (
                <p className="text-center text-gray-400 py-8">
                  No projects yet. Create your first project above!
                </p>
              )}
            </div>
          )}
        </div>

        {/* Alternative View: ProjectsList Component */}
        <div className="mt-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">
              Alternative View (with Optimistic View Count)
            </h2>
            <div className="bg-white rounded-xl p-6">
              <ProjectsList />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
