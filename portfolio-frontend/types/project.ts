/**
 * Core Project interface used across the application
 */
export interface Project {
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
 * API response shape for a single project
 */
export interface ProjectResponse {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  views: number;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * API response shape for project list
 */
export interface ProjectListResponse {
  data: ProjectResponse[];
  total: number;
  page?: number;
  pageSize?: number;
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
