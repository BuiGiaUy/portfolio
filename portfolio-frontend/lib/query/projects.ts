'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import { projectService } from '@/services/project.service';
import { Project, ViewMode, ViewIncrementResponse } from '@/types/project';

/**
 * Query Keys
 * Centralized query keys for better cache management
 */
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters?: Record<string, string | number | boolean>) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

/**
 * Fetch all projects
 */
export function useProjects(): UseQueryResult<Project[], Error> {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: () => projectService.getProjects(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch a single project by ID
 */
export function useProject(id: string): UseQueryResult<Project | null, Error> {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectService.getProjectById(id),
    enabled: !!id, // Only run if ID is provided
    staleTime: 10 * 60 * 1000, // 10 minutes for individual projects
  });
}

/**
 * Create a new project
 */
export function useCreateProject(): UseMutationResult<
  Project,
  Error,
  Partial<Project>
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Project>) => projectService.createProject(data),
    onSuccess: (newProject) => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      
      // Optimistically add to cache
      queryClient.setQueryData<Project[]>(projectKeys.lists(), (old) => {
        return old ? [newProject, ...old] : [newProject];
      });
    },
  });
}

/**
 * Update a project
 */
export function useUpdateProject(): UseMutationResult<
  Project,
  Error,
  { id: string; data: Partial<Project> }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => projectService.updateProject(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(id) });

      // Snapshot previous value
      const previousProject = queryClient.getQueryData<Project>(projectKeys.detail(id));

      // Optimistically update
      queryClient.setQueryData<Project>(projectKeys.detail(id), (old) => {
        return old ? { ...old, ...data } : old;
      });

      return { previousProject };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousProject) {
        queryClient.setQueryData(projectKeys.detail(id), context.previousProject);
      }
    },
    onSettled: (data, error, { id }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/**
 * Delete a project
 */
export function useDeleteProject(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: projectKeys.lists() });

      // Snapshot previous value
      const previousProjects = queryClient.getQueryData<Project[]>(projectKeys.lists());

      // Optimistically remove from list
      queryClient.setQueryData<Project[]>(projectKeys.lists(), (old) => {
        return old ? old.filter((project) => project.id !== id) : old;
      });

      return { previousProjects };
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousProjects) {
        queryClient.setQueryData(projectKeys.lists(), context.previousProjects);
      }
    },
    onSuccess: (data, id) => {
      // Remove from cache completely
      queryClient.removeQueries({ queryKey: projectKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/**
 * Increment project views with optimistic updates
 */
export function useIncrementViews(
  projectId: string
): UseMutationResult<ViewIncrementResponse, Error, ViewMode> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mode: ViewMode = 'optimistic') => 
      projectService.incrementViews(projectId, mode),
    
    onMutate: async (mode) => {
      if (mode !== 'optimistic') return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(projectId) });

      // Snapshot previous value
      const previousProject = queryClient.getQueryData<Project>(
        projectKeys.detail(projectId)
      );

      // Optimistically update the view count
      queryClient.setQueryData<Project>(projectKeys.detail(projectId), (old) => {
        return old ? { ...old, views: old.views + 1 } : old;
      });

      // Also update in the list if present
      queryClient.setQueryData<Project[]>(projectKeys.lists(), (old) => {
        if (!old) return old;
        return old.map((project) =>
          project.id === projectId
            ? { ...project, views: project.views + 1 }
            : project
        );
      });

      return { previousProject };
    },
    
    onError: (err, mode, context) => {
      // Rollback optimistic update on error
      if (mode === 'optimistic' && context?.previousProject) {
        queryClient.setQueryData(
          projectKeys.detail(projectId),
          context.previousProject
        );
      }
    },
    
    onSuccess: (data) => {
      // Update with actual value from server
      if (data.views >= 0) {
        queryClient.setQueryData<Project>(projectKeys.detail(projectId), (old) => {
          return old ? { ...old, views: data.views } : old;
        });

        queryClient.setQueryData<Project[]>(projectKeys.lists(), (old) => {
          if (!old) return old;
          return old.map((project) =>
            project.id === projectId ? { ...project, views: data.views } : project
          );
        });
      }
    },
  });
}

/**
 * Hook for project view count with optimistic updates
 * Simplified interface for components
 */
export function useProjectView(projectId: string) {
  const { mutate, isPending } = useIncrementViews(projectId);
  const { data: project } = useProject(projectId);

  const incrementView = (mode: ViewMode = 'optimistic') => {
    mutate(mode);
  };

  return {
    viewCount: project?.views ?? 0,
    incrementView,
    isIncrementing: isPending,
  };
}
