"use client";

import { useAuth } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: "projects" | "analytics" | "settings" | "users";
  enabled: boolean;
}

export default function PermissionsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: "proj_create",
      name: "Create Projects",
      description: "Allow creating new projects",
      category: "projects",
      enabled: true,
    },
    {
      id: "proj_edit",
      name: "Edit Projects",
      description: "Allow editing existing projects",
      category: "projects",
      enabled: true,
    },
    {
      id: "proj_delete",
      name: "Delete Projects",
      description: "Allow permanent deletion",
      category: "projects",
      enabled: false,
    },
    {
      id: "analytics_view",
      name: "View Analytics",
      description: "Access detailed analytics",
      category: "analytics",
      enabled: true,
    },
    {
      id: "analytics_export",
      name: "Export Analytics",
      description: "Export analytics data",
      category: "analytics",
      enabled: false,
    },
    {
      id: "settings_general",
      name: "General Settings",
      description: "Modify app settings",
      category: "settings",
      enabled: true,
    },
    {
      id: "users_invite",
      name: "Invite Users",
      description: "Send user invitations",
      category: "users",
      enabled: false,
    },
  ]);

  const [activeCategory, setActiveCategory] = useState<
    "all" | Permission["category"]
  >("all");

  const togglePermission = (id: string) => {
    setPermissions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const filteredPermissions =
    activeCategory === "all"
      ? permissions
      : permissions.filter((p) => p.category === activeCategory);

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
            <h1 className="gradient-text text-2xl font-bold">Permissions</h1>
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
        <div className="skill-card mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">{user?.email}</h2>
                <span
                  className="text-xs px-3 py-1 rounded-full"
                  style={{
                    background: "rgba(34,211,209,0.2)",
                    color: "var(--accent)",
                  }}
                >
                  Admin
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          {(["all", "projects", "analytics", "settings", "users"] as const).map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={
                  activeCategory === cat
                    ? "btn-glow px-4 py-2"
                    : "btn-outline-premium px-4 py-2"
                }
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            )
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPermissions.map((perm) => (
            <div key={perm.id} className="skill-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold mb-1">{perm.name}</h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--neutral-400)" }}
                  >
                    {perm.description}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={perm.enabled}
                    onChange={() => togglePermission(perm.id)}
                    className="sr-only peer"
                  />
                  <div
                    className={`w-11 h-6 rounded-full ${
                      perm.enabled ? "bg-teal-500" : "bg-gray-700"
                    } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}
                  ></div>
                </label>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
