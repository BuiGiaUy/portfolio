/**
 * Core Project interface used across the application
 * Updated to match backend schema
 */
export interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  content: string;
  techStack: string[];
  thumbnailUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  // Computed/joined fields
  views?: number;
}

/**
 * API response shape for a single project
 */
export interface ProjectResponse {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  content: string;
  techStack: string[];
  thumbnailUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Legacy Project interface for compatibility
 * Maps old fields to new schema
 */
export interface LegacyProject {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  views: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * View increment mode
 */
export type ViewMode = 'optimistic' | 'pessimistic';

/**
 * View increment response
 */
export interface ViewIncrementResponse {
  id: string;
  views: number;
}
