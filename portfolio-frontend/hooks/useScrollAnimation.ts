import { useEffect } from 'react';

/**
 * Custom hook to handle fade-in animation on scroll
 * Uses IntersectionObserver to detect when elements with .fade-in class enter viewport
 * Automatically adds .visible class to trigger CSS transition
 */
export const useScrollAnimation = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
};
