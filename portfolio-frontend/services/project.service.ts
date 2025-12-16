/**
 * Project Service
 * Uses the new API client for all project-related operations
 */

'use client';

import { apiClient } from '@/lib/api';
import { Project, ProjectListResponse, ViewMode, ViewIncrementResponse } from '@/types/project';

/**
 * Project Service Class
 */
class ProjectService {
  private readonly baseUrl = '/projects';

  /**
   * Fetch all projects
   */
  async getProjects(): Promise<Project[]> {
    const response = await apiClient.get<ProjectListResponse>(this.baseUrl);
    return response.data;
  }

  /**
   * Fetch a single project by ID
   */
  async getProjectById(id: string): Promise<Project | null> {
    try {
      const response = await apiClient.get<Project>(`${this.baseUrl}/${id}`);
      return response;
    } catch (error: unknown) {
      // Return null for 404 errors
      if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Increment project views
   */
  async incrementViews(id: string, mode: ViewMode = 'optimistic'): Promise<ViewIncrementResponse> {
    try {
      const response = await apiClient.post<ViewIncrementResponse>(
        `${this.baseUrl}/${id}/view-${mode}`
      );
      return response;
    } catch (error) {
      console.error(`Failed to increment views for project ${id}:`, error);
      // Return fallback response
      return { id, views: -1 };
    }
  }

  /**
   * Create a new project (requires authentication)
   */
  async createProject(data: Partial<Project>): Promise<Project> {
    const response = await apiClient.post<Project>(this.baseUrl, data);
    return response;
  }

  /**
   * Update a project (requires authentication)
   */
  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const response = await apiClient.put<Project>(`${this.baseUrl}/${id}`, data);
    return response;
  }

  /**
   * Delete a project (requires authentication)
   */
  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

// Export singleton instance
export const projectService = new ProjectService();

/**
 * React Hook for fetching projects
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
      const data = await projectService.getProjects();
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
        const data = await projectService.getProjects();
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
 * Hook for managing project view state
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
        const result = await projectService.incrementViews(projectId, mode);
        
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
