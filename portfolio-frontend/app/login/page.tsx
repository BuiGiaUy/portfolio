"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/api";
import { useAuthState } from "@/lib/auth-utils";
import { useRouter } from "next/navigation";

/**
 * Login Page Demo
 * Shows how to use auth with React Query integration
 */
export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading: authLoading } = useAuth();
  const { isAuthenticated, isLoading: checkingAuth } = useAuthState();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Redirect if already authenticated
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Gradient blobs for ambient effect */}
      <div className="gradient-blob absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-accent/20 to-transparent"></div>
      <div className="gradient-blob absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-accent-muted/20 to-transparent"></div>

      <div className="skill-card w-full max-w-md animate-scale-in relative z-10">
        <div className="text-center mb-8">
          {/* Badge */}
          <div className="hero-badge inline-flex mb-4">
            <span className="hero-badge-dot"></span>
            <span>Secure Login</span>
          </div>

          <h1 className="gradient-text-animated text-3xl font-bold mb-2">
            Welcome Back
          </h1>
          <p className="text-muted" style={{ color: "var(--neutral-400)" }}>
            Sign in to access your dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="animate-fade-in-up animation-delay-100">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--neutral-300)" }}
            >
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-lg border transition-all duration-300"
              style={{
                background: "var(--glass-bg)",
                borderColor: "var(--border-default)",
                color: "var(--foreground)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--border-default)")
              }
            />
          </div>

          <div className="animate-fade-in-up animation-delay-200">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--neutral-300)" }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-lg border transition-all duration-300"
              style={{
                background: "var(--glass-bg)",
                borderColor: "var(--border-default)",
                color: "var(--foreground)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--border-default)")
              }
            />
          </div>

          {error && (
            <div
              className="animate-bounce-in p-3 rounded-lg border"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                borderColor: "rgba(239, 68, 68, 0.3)",
              }}
            >
              <p className="text-sm" style={{ color: "#ef4444" }}>
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className="btn-glow w-full py-3 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in-up animation-delay-300"
          >
            {authLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 text-center animate-fade-in-up animation-delay-400">
          <p className="text-sm" style={{ color: "var(--neutral-400)" }}>
            Don&apos;t have an account?{" "}
            <a
              href="/register"
              className="font-medium transition-colors"
              style={{ color: "var(--accent)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--accent-muted)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--accent)")
              }
            >
              Sign up
            </a>
          </p>
        </div>

        {/* Demo credentials (remove in production) */}
        <div
          className="mt-6 p-4 rounded-lg border animate-fade-in-up animation-delay-500"
          style={{
            background: "rgba(234, 179, 8, 0.1)",
            borderColor: "rgba(234, 179, 8, 0.3)",
          }}
        >
          <p
            className="text-xs font-semibold mb-2"
            style={{ color: "#fbbf24" }}
          >
            Demo Credentials:
          </p>
          <div
            className="text-xs space-y-1 font-mono"
            style={{ color: "#fde047" }}
          >
            <div>Email: admin@example.com</div>
            <div>Password: Admin123!@#</div>
          </div>
        </div>
      </div>
    </div>
  );
}
