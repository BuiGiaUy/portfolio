"use client";

import { useAuth } from "@/lib/api";
import { useProjects } from "@/lib/query";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { data: projects, isLoading } = useProjects();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">(
    "30d"
  );

  const stats = useMemo(() => {
    if (!projects)
      return { totalProjects: 0, totalViews: 0, avgViews: 0, topProject: null };

    const totalProjects = projects.length;
    const totalViews = projects.reduce((sum, p) => sum + (p.views || 0), 0);
    const avgViews =
      totalProjects > 0 ? Math.round(totalViews / totalProjects) : 0;
    const topProject = projects.reduce(
      (top, p) => (!top || (p.views || 0) > (top.views || 0) ? p : top),
      projects[0]
    );

    return { totalProjects, totalViews, avgViews, topProject };
  }, [projects]);

  const chartData = useMemo(() => {
    if (!projects) return [];
    return projects
      .slice(0, 5)
      .map((p) => ({ name: p.title, views: p.views || 0 }));
  }, [projects]);

  const maxViews = Math.max(...chartData.map((d) => d.views), 1);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <header className="navbar">
        <div className="navbar-container">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm"
              style={{ color: "var(--neutral-400)" }}
            >
              ← Back
            </button>
            <h1 className="gradient-text text-2xl font-bold">Analytics</h1>
          </div>
          <button
            onClick={() => logout().then(() => router.push("/login"))}
            className="btn-outline-premium px-4 py-2"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="container-custom py-8 animate-slide-up">
        {/* Time Range Selector */}
        <div className="flex gap-3 mb-6">
          {(["7d", "30d", "90d", "all"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={
                timeRange === range
                  ? "btn-glow px-4 py-2"
                  : "btn-outline-premium px-4 py-2"
              }
            >
              {range === "all" ? "All Time" : `Last ${range.slice(0, -1)} days`}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="skill-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500/20 to-transparent flex items-center justify-center">
                <svg
                  className="w-5 h-5"
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
            </div>
            <p className="text-sm mb-2" style={{ color: "var(--neutral-400)" }}>
              Total Projects
            </p>
            <p className="text-3xl font-bold gradient-text">
              {isLoading ? "..." : stats.totalProjects}
            </p>
            <p className="text-xs mt-2" style={{ color: "var(--neutral-500)" }}>
              +2 this month
            </p>
          </div>

          <div className="skill-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-transparent flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  style={{ color: "#a78bfa" }}
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
            <p className="text-sm mb-2" style={{ color: "var(--neutral-400)" }}>
              Total Views
            </p>
            <p className="text-3xl font-bold" style={{ color: "#a78bfa" }}>
              {isLoading ? "..." : stats.totalViews.toLocaleString()}
            </p>
            <p className="text-xs mt-2" style={{ color: "var(--neutral-500)" }}>
              +15% from last period
            </p>
          </div>

          <div className="skill-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-transparent flex items-center justify-center">
                <svg
                  className="w-5 h-5"
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
            </div>
            <p className="text-sm mb-2" style={{ color: "var(--neutral-400)" }}>
              Avg Views/Project
            </p>
            <p className="text-3xl font-bold" style={{ color: "#60a5fa" }}>
              {isLoading ? "..." : stats.avgViews}
            </p>
            <p className="text-xs mt-2" style={{ color: "var(--neutral-500)" }}>
              Across all projects
            </p>
          </div>

          <div className="skill-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-transparent flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  style={{ color: "#fbbf24" }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            <p className="text-sm mb-2" style={{ color: "var(--neutral-400)" }}>
              Top Project
            </p>
            <p
              className="text-lg font-bold truncate"
              style={{ color: "#fbbf24" }}
            >
              {isLoading ? "..." : stats.topProject?.title || "N/A"}
            </p>
            <p className="text-xs mt-2" style={{ color: "var(--neutral-500)" }}>
              {stats.topProject?.views || 0} views
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="skill-card">
            <h2 className="section-title-premium text-xl mb-6">
              Top Projects by Views
            </h2>
            <div className="space-y-4">
              {chartData.map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--foreground)", maxWidth: "60%" }}
                    >
                      {item.name}
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: "var(--accent)" }}
                    >
                      {item.views}
                    </span>
                  </div>
                  <div
                    className="w-full h-3 rounded-full"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-purple-600 transition-all duration-500"
                      style={{ width: `${(item.views / maxViews) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="skill-card">
            <h2 className="section-title-premium text-xl mb-6">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {[
                {
                  action: "Project viewed",
                  project: "Portfolio System",
                  time: "2 minutes ago",
                },
                {
                  action: "Project created",
                  project: "New Feature",
                  time: "1 hour ago",
                },
                {
                  action: "Project updated",
                  project: "Dashboard UI",
                  time: "3 hours ago",
                },
                {
                  action: "Project viewed",
                  project: "API Integration",
                  time: "5 hours ago",
                },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-all"
                >
                  <div
                    className="w-2 h-2 rounded-full mt-2"
                    style={{ background: "var(--accent)" }}
                  ></div>
                  <div className="flex-1">
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--foreground)" }}
                    >
                      {activity.action}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: "var(--neutral-400)" }}
                    >
                      {activity.project}
                    </p>
                  </div>
                  <span
                    className="text-xs"
                    style={{ color: "var(--neutral-500)" }}
                  >
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div className="mt-6 skill-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Export Analytics Data</h3>
              <p className="text-sm" style={{ color: "var(--neutral-400)" }}>
                Download your analytics data in CSV format
              </p>
            </div>
            <button className="btn-glow px-6 py-2">
              <svg
                className="w-4 h-4 mr-2 inline"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export CSV
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
