"use client";

import { useAuth } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Profile Settings Page
 * Allows users to manage their profile information, password, and preferences
 */
export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "preferences"
  >("profile");
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    name: user?.email?.split("@")[0] || "",
    email: user?.email || "",
    bio: "",
    location: "",
    website: "",
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    projectUpdates: true,
    marketingEmails: false,
    twoFactorAuth: false,
  });

  const handleProfileSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    alert("Profile updated successfully!");
  };

  const handlePasswordChange = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    setSecurityData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    alert("Password changed successfully!");
  };

  const handlePreferencesSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert("Preferences updated!");
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <header className="navbar">
        <div className="navbar-container">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm"
              style={{ color: "var(--neutral-400)" }}
            >
              ← Back to Dashboard
            </button>
            <h1 className="gradient-text text-2xl font-bold">Settings</h1>
          </div>
          <button
            onClick={handleLogout}
            className="btn-outline-premium px-4 py-2"
            style={{
              borderColor: "var(--border-default)",
              color: "var(--foreground)",
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8 animate-slide-up">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="skill-card sticky top-24">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    activeTab === "profile"
                      ? "bg-gradient-to-r from-teal-500/10 to-transparent border-l-2"
                      : "hover:bg-white/5"
                  }`}
                  style={{
                    borderColor:
                      activeTab === "profile" ? "var(--accent)" : "transparent",
                    color:
                      activeTab === "profile"
                        ? "var(--accent)"
                        : "var(--neutral-400)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="font-medium">Profile</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("security")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    activeTab === "security"
                      ? "bg-gradient-to-r from-teal-500/10 to-transparent border-l-2"
                      : "hover:bg-white/5"
                  }`}
                  style={{
                    borderColor:
                      activeTab === "security"
                        ? "var(--accent)"
                        : "transparent",
                    color:
                      activeTab === "security"
                        ? "var(--accent)"
                        : "var(--neutral-400)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span className="font-medium">Security</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("preferences")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    activeTab === "preferences"
                      ? "bg-gradient-to-r from-teal-500/10 to-transparent border-l-2"
                      : "hover:bg-white/5"
                  }`}
                  style={{
                    borderColor:
                      activeTab === "preferences"
                        ? "var(--accent)"
                        : "transparent",
                    color:
                      activeTab === "preferences"
                        ? "var(--accent)"
                        : "var(--neutral-400)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5"
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
                    <span className="font-medium">Preferences</span>
                  </div>
                </button>
              </nav>
            </div>
          </aside>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="skill-card animate-fade-in-up">
                <h2 className="section-title-premium text-xl mb-6">
                  Profile Information
                </h2>

                <div className="space-y-6">
                  {/* Avatar */}
                  <div
                    className="flex items-center gap-6 p-6 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                      {profileData.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <button className="btn-glow px-4 py-2 text-sm">
                        Change Avatar
                      </button>
                      <p
                        className="text-xs mt-2"
                        style={{ color: "var(--neutral-400)" }}
                      >
                        JPG, PNG or GIF. Max size 2MB
                      </p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--foreground)" }}
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2"
                        style={{
                          background: "var(--background)",
                          borderColor: "var(--border-default)",
                          color: "var(--foreground)",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--foreground)" }}
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2"
                        style={{
                          background: "var(--background)",
                          borderColor: "var(--border-default)",
                          color: "var(--foreground)",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      Bio
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bio: e.target.value })
                      }
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2"
                      style={{
                        background: "var(--background)",
                        borderColor: "var(--border-default)",
                        color: "var(--foreground)",
                      }}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--foreground)" }}
                      >
                        Location
                      </label>
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            location: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2"
                        style={{
                          background: "var(--background)",
                          borderColor: "var(--border-default)",
                          color: "var(--foreground)",
                        }}
                        placeholder="City, Country"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--foreground)" }}
                      >
                        Website
                      </label>
                      <input
                        type="url"
                        value={profileData.website}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            website: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2"
                        style={{
                          background: "var(--background)",
                          borderColor: "var(--border-default)",
                          color: "var(--foreground)",
                        }}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleProfileSave}
                      disabled={isSaving}
                      className="btn-glow px-6 py-3"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() =>
                        setProfileData({
                          name: user?.email?.split("@")[0] || "",
                          email: user?.email || "",
                          bio: "",
                          location: "",
                          website: "",
                        })
                      }
                      className="btn-outline-premium px-6 py-3"
                      style={{
                        borderColor: "var(--border-default)",
                        color: "var(--foreground)",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="skill-card animate-fade-in-up">
                <h2 className="section-title-premium text-xl mb-6">
                  Security Settings
                </h2>

                <div className="space-y-6">
                  {/* Password Change */}
                  <div
                    className="p-6 rounded-lg border"
                    style={{
                      borderColor: "var(--border-subtle)",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    <h3
                      className="font-semibold mb-4"
                      style={{ color: "var(--foreground)" }}
                    >
                      Change Password
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: "var(--foreground)" }}
                        >
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={securityData.currentPassword}
                          onChange={(e) =>
                            setSecurityData({
                              ...securityData,
                              currentPassword: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2"
                          style={{
                            background: "var(--background)",
                            borderColor: "var(--border-default)",
                            color: "var(--foreground)",
                          }}
                        />
                      </div>

                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: "var(--foreground)" }}
                        >
                          New Password
                        </label>
                        <input
                          type="password"
                          value={securityData.newPassword}
                          onChange={(e) =>
                            setSecurityData({
                              ...securityData,
                              newPassword: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2"
                          style={{
                            background: "var(--background)",
                            borderColor: "var(--border-default)",
                            color: "var(--foreground)",
                          }}
                        />
                      </div>

                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: "var(--foreground)" }}
                        >
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={securityData.confirmPassword}
                          onChange={(e) =>
                            setSecurityData({
                              ...securityData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2"
                          style={{
                            background: "var(--background)",
                            borderColor: "var(--border-default)",
                            color: "var(--foreground)",
                          }}
                        />
                      </div>

                      <button
                        onClick={handlePasswordChange}
                        disabled={
                          isSaving ||
                          !securityData.currentPassword ||
                          !securityData.newPassword
                        }
                        className="btn-glow px-6 py-3"
                      >
                        {isSaving ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div
                    className="p-6 rounded-lg border"
                    style={{
                      borderColor: "var(--border-subtle)",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3
                          className="font-semibold mb-2"
                          style={{ color: "var(--foreground)" }}
                        >
                          Two-Factor Authentication
                        </h3>
                        <p
                          className="text-sm"
                          style={{ color: "var(--neutral-400)" }}
                        >
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <button
                        className="btn-glow px-4 py-2"
                        onClick={() =>
                          alert("Two-factor authentication setup coming soon!")
                        }
                      >
                        Enable
                      </button>
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div
                    className="p-6 rounded-lg border"
                    style={{
                      borderColor: "var(--border-subtle)",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    <h3
                      className="font-semibold mb-4"
                      style={{ color: "var(--foreground)" }}
                    >
                      Active Sessions
                    </h3>
                    <div className="space-y-3">
                      <div
                        className="flex items-center justify-between p-4 rounded-lg"
                        style={{ background: "rgba(13,148,136,0.05)" }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center">
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div>
                            <p
                              className="font-medium"
                              style={{ color: "var(--foreground)" }}
                            >
                              Windows • Chrome
                            </p>
                            <p
                              className="text-sm"
                              style={{ color: "var(--neutral-400)" }}
                            >
                              Current session • Active now
                            </p>
                          </div>
                        </div>
                        <span
                          className="text-xs px-3 py-1 rounded-full"
                          style={{
                            background: "rgba(34,211,209,0.2)",
                            color: "var(--accent)",
                          }}
                        >
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <div className="skill-card animate-fade-in-up">
                <h2 className="section-title-premium text-xl mb-6">
                  Preferences
                </h2>

                <div className="space-y-6">
                  {/* Notification Settings */}
                  <div
                    className="p-6 rounded-lg border"
                    style={{
                      borderColor: "var(--border-subtle)",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    <h3
                      className="font-semibold mb-4"
                      style={{ color: "var(--foreground)" }}
                    >
                      Email Notifications
                    </h3>

                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 rounded-lg cursor-pointer hover:bg-white/5 transition-all">
                        <div>
                          <p
                            className="font-medium"
                            style={{ color: "var(--foreground)" }}
                          >
                            Email Notifications
                          </p>
                          <p
                            className="text-sm"
                            style={{ color: "var(--neutral-400)" }}
                          >
                            Receive email about account activity
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.emailNotifications}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              emailNotifications: e.target.checked,
                            })
                          }
                          className="w-5 h-5 rounded cursor-pointer"
                          style={{ accentColor: "var(--accent)" }}
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 rounded-lg cursor-pointer hover:bg-white/5 transition-all">
                        <div>
                          <p
                            className="font-medium"
                            style={{ color: "var(--foreground)" }}
                          >
                            Project Updates
                          </p>
                          <p
                            className="text-sm"
                            style={{ color: "var(--neutral-400)" }}
                          >
                            Get notified about project views and interactions
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.projectUpdates}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              projectUpdates: e.target.checked,
                            })
                          }
                          className="w-5 h-5 rounded cursor-pointer"
                          style={{ accentColor: "var(--accent)" }}
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 rounded-lg cursor-pointer hover:bg-white/5 transition-all">
                        <div>
                          <p
                            className="font-medium"
                            style={{ color: "var(--foreground)" }}
                          >
                            Marketing Emails
                          </p>
                          <p
                            className="text-sm"
                            style={{ color: "var(--neutral-400)" }}
                          >
                            Receive updates about new features and tips
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.marketingEmails}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              marketingEmails: e.target.checked,
                            })
                          }
                          className="w-5 h-5 rounded cursor-pointer"
                          style={{ accentColor: "var(--accent)" }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Display Settings */}
                  <div
                    className="p-6 rounded-lg border"
                    style={{
                      borderColor: "var(--border-subtle)",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    <h3
                      className="font-semibold mb-4"
                      style={{ color: "var(--foreground)" }}
                    >
                      Display Settings
                    </h3>
                    <p
                      className="text-sm mb-4"
                      style={{ color: "var(--neutral-400)" }}
                    >
                      Customize how your dashboard looks
                    </p>
                    <button
                      className="btn-outline-premium px-4 py-2"
                      style={{
                        borderColor: "var(--border-default)",
                        color: "var(--foreground)",
                      }}
                    >
                      Theme Settings
                    </button>
                  </div>

                  {/* Save Button */}
                  <div className="flex gap-4">
                    <button
                      onClick={handlePreferencesSave}
                      disabled={isSaving}
                      className="btn-glow px-6 py-3"
                    >
                      {isSaving ? "Saving..." : "Save Preferences"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
