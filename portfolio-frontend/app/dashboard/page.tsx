"use client";

import { useAuth } from "@/lib/api";
import { useProjects } from "@/lib/query";
import { useRouter } from "next/navigation";

/**
 * Protected Dashboard Page
 * Only accessible to authenticated users (protected by middleware)
 */
export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading, hasRole } = useAuth();
  const isOwner = hasRole("OWNER");
  const { data: projects, isLoading: projectsLoading } = useProjects();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
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
            <h1 className="gradient-text text-2xl font-bold">Dashboard</h1>
            {user && (
              <p
                className="text-sm mt-1"
                style={{ color: "var(--neutral-400)" }}
              >
                Welcome back, {user.email}
              </p>
            )}
          </div>

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
      </header>

      {/* Main Content */}
      <main className="container-custom py-8 animate-slide-up">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-32">
          <div className="skill-card animate-fade-in-up animation-delay-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: "var(--neutral-400)" }}>
                  Total Projects
                </p>
                <p className="text-3xl font-bold mt-2 gradient-text">
                  {projectsLoading ? "..." : projects?.length || 0}
                </p>
              </div>
              <div className="skill-card-icon w-12 h-12">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="skill-card animate-fade-in-up animation-delay-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: "var(--neutral-400)" }}>
                  Total Views
                </p>
                <p className="text-3xl font-bold mt-2 gradient-text">
                  {projectsLoading
                    ? "..."
                    : projects?.reduce((sum, p) => sum + (p.views || 0), 0) ||
                      0}
                </p>
              </div>
              <div className="skill-card-icon w-12 h-12">
                <svg
                  className="w-6 h-6"
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
              </div>
            </div>
          </div>

          <div className="skill-card animate-fade-in-up animation-delay-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: "var(--neutral-400)" }}>
                  Account Status
                </p>
                <p
                  className="text-xl font-semibold mt-2"
                  style={{ color: "var(--accent)" }}
                >
                  Active
                </p>
              </div>
              <div className="skill-card-icon w-12 h-12">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="skill-card mb-8 animate-fade-in-up animation-delay-400">
          <h2 className="section-title-premium text-xl mb-4">
            Recent Projects
          </h2>

          {projectsLoading ? (
            <div className="text-center py-8">
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
                style={{ borderColor: "var(--accent)" }}
              ></div>
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="space-y-3">
              {projects.slice(0, 5).map((project, index) => (
                <div
                  key={project.id}
                  className="project-card rounded-lg p-4 hover-lift"
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3
                        className="font-medium"
                        style={{ color: "var(--foreground)" }}
                      >
                        {project.title}
                      </h3>
                      <p
                        className="text-sm mt-1"
                        style={{ color: "var(--neutral-400)" }}
                      >
                        {project.shortDescription}
                      </p>
                    </div>
                    <div className="text-right">
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p
              className="text-center py-8"
              style={{ color: "var(--neutral-400)" }}
            >
              No projects yet
            </p>
          )}

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => router.push("/dashboard/projects")}
              className="btn-glow px-6 py-2"
            >
              View All Projects
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up animation-delay-500">
          <button
            onClick={() => router.push("/dashboard/projects")}
            className="contact-cta text-left hover-lift transition-all"
            style={{
              background:
                "linear-gradient(135deg, rgba(13, 148, 136, 0.1), transparent)",
              borderColor: "var(--border-subtle)",
              padding: "2rem",
            }}
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500/20 to-transparent flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6"
                style={{ color: "var(--accent)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 gradient-text">
              {isOwner ? "Manage Projects" : "View Projects"}
            </h3>
            <p style={{ color: "var(--neutral-400)" }}>
              {isOwner
                ? "View, create, and edit your projects"
                : "Browse and view projects (read-only)"}
            </p>
          </button>

          <button
            onClick={() => router.push("/dashboard/analytics")}
            className="contact-cta text-left hover-lift transition-all"
            style={{
              background:
                "linear-gradient(135deg, rgba(129, 140, 248, 0.1), transparent)",
              borderColor: "var(--border-subtle)",
              padding: "2rem",
            }}
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-transparent flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6"
                style={{ color: "#60a5fa" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 gradient-text">
              Analytics Dashboard
            </h3>
            <p style={{ color: "var(--neutral-400)" }}>
              Track views, engagement, and insights
            </p>
          </button>

          <button
            onClick={() => router.push("/dashboard/settings")}
            className="contact-cta text-left hover-lift transition-all"
            style={{
              background:
                "linear-gradient(135deg, rgba(168, 85, 247, 0.1), transparent)",
              borderColor: "var(--border-subtle)",
              padding: "2rem",
            }}
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-transparent flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6"
                style={{ color: "#a78bfa" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 gradient-text">
              Profile Settings
            </h3>
            <p style={{ color: "var(--neutral-400)" }}>
              Manage your profile and preferences
            </p>
          </button>

          {isOwner && (
            <button
              onClick={() => router.push("/dashboard/permissions")}
              className="contact-cta text-left hover-lift transition-all"
              style={{
                background:
                  "linear-gradient(135deg, rgba(236, 72, 153, 0.1), transparent)",
                borderColor: "var(--border-subtle)",
                padding: "2rem",
              }}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500/20 to-transparent flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6"
                  style={{ color: "#ec4899" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 gradient-text">
                Permissions
              </h3>
              <p style={{ color: "var(--neutral-400)" }}>
                Manage roles and access control
              </p>
            </button>
          )}

          <button
            onClick={() => router.push("/projects")}
            className="contact-cta text-left hover-lift transition-all"
            style={{
              background:
                "linear-gradient(135deg, rgba(251, 191, 36, 0.1), transparent)",
              borderColor: "var(--border-subtle)",
              padding: "2rem",
            }}
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500/20 to-transparent flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6"
                style={{ color: "#fbbf24" }}
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
            </div>
            <h3 className="text-xl font-bold mb-2 gradient-text">
              View Public Portfolio
            </h3>
            <p style={{ color: "var(--neutral-400)" }}>
              See how your projects appear to visitors
            </p>
          </button>

          <button
            onClick={() => alert("Documentation coming soon!")}
            className="contact-cta text-left hover-lift transition-all"
            style={{
              background:
                "linear-gradient(135deg, rgba(34, 197, 94, 0.1), transparent)",
              borderColor: "var(--border-subtle)",
              padding: "2rem",
            }}
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-transparent flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6"
                style={{ color: "#22c55e" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 gradient-text">
              Documentation
            </h3>
            <p style={{ color: "var(--neutral-400)" }}>
              Learn how to use the platform
            </p>
          </button>
        </div>
      </main>
    </div>
  );
}
