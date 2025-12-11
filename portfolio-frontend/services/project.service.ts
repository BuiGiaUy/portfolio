'use client';

import { Project, ProjectListResponse, ViewMode, ViewIncrementResponse } from '@/types/project';

/**
 * API Base URL configuration
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Fetch all projects from the backend
 * Uses Next.js caching with 60-second revalidation
 */
export async function fetchProjects(): Promise<Project[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new ApiError(
        `Failed to fetch projects`,
        response.status,
        response.statusText
      );
    }

    const data: ProjectListResponse = await response.json();
    return data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Failed to fetch projects:', error);
    throw new ApiError('Network error while fetching projects', 0, 'Network Error');
  }
}

/**
 * Fetch a single project by ID
 */
export async function fetchProjectById(id: string): Promise<Project | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new ApiError(
        `Failed to fetch project ${id}`,
        response.status,
        response.statusText
      );
    }

    const project: Project = await response.json();
    return project;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error(`Failed to fetch project ${id}:`, error);
    throw new ApiError(`Network error while fetching project ${id}`, 0, 'Network Error');
  }
}

/**
 * Increment project views
 * @param id - Project ID
 * @param mode - 'optimistic' or 'pessimistic' view increment mode
 * @returns Updated view count
 */
export async function incrementProjectView(
  id: string,
  mode: ViewMode = 'optimistic'
): Promise<ViewIncrementResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${id}/view-${mode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new ApiError(
        `Failed to increment views for project ${id}`,
        response.status,
        response.statusText
      );
    }

    const data: ViewIncrementResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Log but don't throw - view increment is not critical
    console.error(`Failed to increment views for project ${id}:`, error);
    // Return a fallback response
    return { id, views: -1 };
  }
}

/**
 * React Hook for fetching projects with loading and error states
 */
import React from 'react';

export interface UseProjectsResult {
  projects: Project[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useProjects(): UseProjectsResult {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch projects'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchProjects();
        if (isMounted) {
          setProjects(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch projects'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { projects, isLoading, error, refetch: fetchData };
}

/**
 * Hook for managing project view state with optimistic updates
 */
export interface UseProjectViewResult {
  incrementView: (mode?: ViewMode) => Promise<number>;
  viewCount: number;
  isIncrementing: boolean;
}

export function useProjectView(
  projectId: string,
  initialViews: number
): UseProjectViewResult {
  const [viewCount, setViewCount] = React.useState(initialViews);
  const [isIncrementing, setIsIncrementing] = React.useState(false);

  const incrementView = React.useCallback(
    async (mode: ViewMode = 'optimistic'): Promise<number> => {
      setIsIncrementing(true);

      // Optimistic update
      if (mode === 'optimistic') {
        setViewCount((prev) => prev + 1);
      }

      try {
        const result = await incrementProjectView(projectId, mode);
        
        // Update with actual value from server
        if (result.views >= 0) {
          setViewCount(result.views);
        }
        
        return result.views;
      } catch (error) {
        // Rollback optimistic update on error
        if (mode === 'optimistic') {
          setViewCount((prev) => prev - 1);
        }
        console.error('Failed to increment view:', error);
        return viewCount;
      } finally {
        setIsIncrementing(false);
      }
    },
    [projectId, viewCount]
  );

  return { incrementView, viewCount, isIncrementing };
}
