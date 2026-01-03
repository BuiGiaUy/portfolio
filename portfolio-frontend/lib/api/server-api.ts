/**
 * Server-side API utilities for Next.js Server Components and generateMetadata
 * These functions run on the server and can be used in page.tsx files
 */

import { Project } from '@/types/project';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Fetch a project by its slug from the server
 * Used for generateMetadata and Server Components
 */
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/slug/${slug}`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch project: ${response.statusText}`);
    }

    const project = await response.json();
    return project;
  } catch (error) {
    console.error(`Error fetching project by slug "${slug}":`, error);
    return null;
  }
}

/**
 * Fetch all projects from the server
 * Used for sitemap generation
 */
export async function getAllProjects(): Promise<Project[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const projects = await response.json();
    return Array.isArray(projects) ? projects : [];
  } catch (error) {
    console.error('Error fetching all projects:', error);
    return [];
  }
}
