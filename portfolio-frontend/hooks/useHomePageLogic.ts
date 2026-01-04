import { useCallback, useEffect, useRef } from "react";
import type { Project } from "@/types/project";

/**
 * Custom hook for home page logic
 * Encapsulates scroll animation and project view handling
 */
export function useHomePageLogic() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleProjectView = useCallback((project: Project) => {
    // View tracking handled by ProjectDetailContent component
  }, []);

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Scroll-triggered animation
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".scroll-reveal");
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  return {
    handleProjectView,
    scrollToSection,
  };
}
