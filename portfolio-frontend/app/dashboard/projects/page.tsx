"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/api";
import { useProjects, useDeleteProject } from "@/lib/query";
import { Project } from "@/types/project";
import { ProjectForm } from "@/components/ProjectForm";
import { useToast } from "@/components/Toast";

type ViewMode = "list" | "create" | "edit";

export default function DashboardProjectsPage() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading, hasRole } = useAuth();
  const isOwner = hasRole("OWNER");
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const deleteProject = useDeleteProject();
  const { success, error: showError } = useToast();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleCreateNew = () => {
    setEditingProject(null);
    setViewMode("create");
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setViewMode("edit");
  };

  const handleDelete = async (project: Project) => {
    if (!confirm(`Are you sure you want to delete "${project.title}"?`)) return;

    setDeletingId(project.id);
    try {
      await deleteProject.mutateAsync(project.id);
      success("Project Deleted", `"${project.title}" has been deleted`);
    } catch (err) {
      showError(
        "Delete Failed",
        err instanceof Error ? err.message : "Unknown error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSuccess = () => {
    setViewMode("list");
    setEditingProject(null);
  };

  const handleFormCancel = () => {
    setViewMode("list");
    setEditingProject(null);
  };

  if (authLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--background)" }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: "var(--accent)" }}
          ></div>
          <p style={{ color: "var(--neutral-400)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <header className="navbar">
        <div className="navbar-container">
          <div>
            <h1 className="gradient-text text-2xl font-bold">
              Projects Management
            </h1>
            {user && (
              <p
                className="text-sm mt-1"
                style={{ color: "var(--neutral-400)" }}
              >
                {viewMode === "list"
                  ? "Manage your projects"
                  : viewMode === "create"
                  ? "Create new project"
                  : `Editing: ${editingProject?.title}`}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {viewMode !== "list" && (
              <button
                onClick={handleFormCancel}
                className="btn-outline-premium px-4 py-2 text-sm"
              >
                ← Back to List
              </button>
            )}
            <button
              onClick={handleLogout}
              className="btn-outline-premium px-4 py-2"
              style={{
                borderColor: "var(--border-default)",
                color: "var(--foreground)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#ef4444";
                e.currentTarget.style.color = "#ef4444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-default)";
                e.currentTarget.style.color = "var(--foreground)";
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-40 container-custom py-8 animate-slide-up">
        {viewMode === "list" ? (
          <>
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-8 mt-32">
              <div>
                <h2 className="section-title-premium text-xl">All Projects</h2>
                <p className="text-sm" style={{ color: "var(--neutral-400)" }}>
                  {projectsLoading
                    ? "Loading..."
                    : `${projects?.length || 0} projects total`}
                </p>
              </div>
              {isOwner && (
                <button
                  onClick={handleCreateNew}
                  className="btn-glow px-6 py-3"
                >
                  + Create New Project
                </button>
              )}
            </div>

            {/* Projects List */}
            <div className="skill-card">
              {projectsLoading ? (
                <div className="text-center py-12">
                  <div
                    className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto"
                    style={{ borderColor: "var(--accent)" }}
                  ></div>
                </div>
              ) : projects && projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.map((project, index) => (
                    <div
                      key={project.id}
                      className="project-card rounded-lg p-4 hover-lift animate-fade-in-up"
                      style={{
                        background: "rgba(255, 255, 255, 0.02)",
                        animationDelay: `${index * 50}ms`,
                      }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Thumbnail */}
                        <div
                          className="w-20 h-20 rounded-lg flex-shrink-0 flex items-center justify-center"
                          style={{
                            background: project.thumbnailUrl
                              ? `url(${project.thumbnailUrl}) center/cover`
                              : "linear-gradient(135deg, var(--neutral-800), var(--neutral-700))",
                          }}
                        >
                          {!project.thumbnailUrl && (
                            <svg
                              className="w-8 h-8"
                              style={{ color: "var(--neutral-500)" }}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3
                              className="font-semibold truncate"
                              style={{ color: "var(--foreground)" }}
                            >
                              {project.title}
                            </h3>
                            <span
                              className="text-xs px-2 py-0.5 rounded"
                              style={{
                                background: "var(--glass-bg)",
                                color: "var(--neutral-400)",
                              }}
                            >
                              /{project.slug}
                            </span>
                          </div>
                          <p
                            className="text-sm mb-2 line-clamp-1"
                            style={{ color: "var(--neutral-400)" }}
                          >
                            {project.shortDescription}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {project.techStack?.slice(0, 4).map((tech) => (
                              <span
                                key={tech}
                                className="project-tag-premium text-xs"
                              >
                                {tech}
                              </span>
                            ))}
                            {project.techStack &&
                              project.techStack.length > 4 && (
                                <span
                                  className="text-xs"
                                  style={{ color: "var(--neutral-500)" }}
                                >
                                  +{project.techStack.length - 4} more
                                </span>
                              )}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="text-right flex-shrink-0">
                          <p
                            className="text-sm"
                            style={{ color: "var(--neutral-400)" }}
                          >
                            Views
                          </p>
                          <p className="font-semibold gradient-text">
                            {project.views || 0}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() =>
                              window.open(`/projects/${project.slug}`, "_blank")
                            }
                            className="p-2 rounded-lg transition-all"
                            style={{ color: "var(--neutral-400)" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color = "var(--accent)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color =
                                "var(--neutral-400)")
                            }
                            title="View"
                          >
                            <svg
                              className="w-5 h-5"
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
                          </button>
                          {isOwner && (
                            <button
                              onClick={() => handleEdit(project)}
                              className="p-2 rounded-lg transition-all"
                              style={{ color: "var(--neutral-400)" }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.color = "#3b82f6")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.color =
                                  "var(--neutral-400)")
                              }
                              title="Edit"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                          )}
                          {isOwner && (
                            <button
                              onClick={() => handleDelete(project)}
                              disabled={deletingId === project.id}
                              className="p-2 rounded-lg transition-all disabled:opacity-50"
                              style={{ color: "var(--neutral-400)" }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.color = "#ef4444")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.color =
                                  "var(--neutral-400)")
                              }
                              title="Delete"
                            >
                              {deletingId === project.id ? (
                                <svg
                                  className="w-5 h-5 animate-spin"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 mx-auto mb-4"
                    style={{ color: "var(--neutral-600)" }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <h3
                    className="text-lg font-medium mb-2"
                    style={{ color: "var(--foreground)" }}
                  >
                    No projects yet
                  </h3>
                  <p className="mb-4" style={{ color: "var(--neutral-400)" }}>
                    {isOwner
                      ? "Create your first project to get started"
                      : "Only the owner can create projects"}
                  </p>
                  {isOwner && (
                    <button
                      onClick={handleCreateNew}
                      className="btn-glow px-6 py-2"
                    >
                      Create Project
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Create/Edit Form */
          <div className="max-w-3xl mx-auto mt-32">
            <div className="skill-card">
              <div className="mb-6">
                <h2 className="section-title-premium text-xl">
                  {viewMode === "create"
                    ? "Create New Project"
                    : "Edit Project"}
                </h2>
                <p className="text-sm" style={{ color: "var(--neutral-400)" }}>
                  {viewMode === "create"
                    ? "Fill in the details to create a new project"
                    : "Update the project information below"}
                </p>
              </div>

              <ProjectForm
                mode={viewMode as "create" | "edit"}
                project={editingProject}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
