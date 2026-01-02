"use client";

import React, {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";

// Toast Types
export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// Toast Context
interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

// Toast Provider
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 11);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (title: string, message?: string) => {
      addToast({ type: "success", title, message, duration: 4000 });
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string) => {
      addToast({ type: "error", title, message, duration: 6000 });
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string) => {
      addToast({ type: "info", title, message, duration: 4000 });
    },
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => {
      addToast({ type: "warning", title, message, duration: 5000 });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, info, warning }}
    >
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Toast Item Component
function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: () => void;
}) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onRemove, 300);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast.duration, onRemove]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onRemove, 300);
  };

  const iconMap = {
    success: (
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
          d="M5 13l4 4L19 7"
        />
      </svg>
    ),
    error: (
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
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
    info: (
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
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    warning: (
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
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
  };

  const colorMap = {
    success: {
      bg: "rgba(16, 185, 129, 0.1)",
      border: "rgba(16, 185, 129, 0.3)",
      icon: "#10b981",
    },
    error: {
      bg: "rgba(239, 68, 68, 0.1)",
      border: "rgba(239, 68, 68, 0.3)",
      icon: "#ef4444",
    },
    info: {
      bg: "rgba(13, 148, 136, 0.1)",
      border: "rgba(13, 148, 136, 0.3)",
      icon: "var(--accent)",
    },
    warning: {
      bg: "rgba(245, 158, 11, 0.1)",
      border: "rgba(245, 158, 11, 0.3)",
      icon: "#f59e0b",
    },
  };

  const colors = colorMap[toast.type];

  return (
    <div
      className={`toast-item ${isExiting ? "toast-exit" : "toast-enter"}`}
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        backdropFilter: "blur(12px)",
        borderRadius: "12px",
        padding: "1rem",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        minWidth: "300px",
        maxWidth: "400px",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div style={{ color: colors.icon, flexShrink: 0 }}>
        {iconMap[toast.type]}
      </div>
      <div style={{ flex: 1 }}>
        <h4
          style={{
            color: "var(--foreground)",
            fontWeight: 600,
            fontSize: "0.875rem",
            marginBottom: toast.message ? "0.25rem" : 0,
          }}
        >
          {toast.title}
        </h4>
        {toast.message && (
          <p style={{ color: "var(--neutral-400)", fontSize: "0.8125rem" }}>
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={handleClose}
        style={{
          color: "var(--neutral-400)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "0.25rem",
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = "var(--foreground)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "var(--neutral-400)")
        }
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

// Toast Container
function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div
      style={{
        position: "fixed",
        top: "6rem",
        right: "1.5rem",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      <style jsx global>{`
        .toast-enter {
          animation: toast-slide-in 0.3s ease-out;
        }
        .toast-exit {
          animation: toast-slide-out 0.3s ease-in forwards;
        }
        @keyframes toast-slide-in {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes toast-slide-out {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
      `}</style>
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

export default ToastProvider;
