'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { incrementProjectView, type UseProjectViewResult } from '@/services/project.service';
import type { ViewMode } from '@/types/project';

export interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  views: number;
  onView?: () => void;
  imageSlot?: React.ReactNode;
  viewMode?: ViewMode;
}

// Fallback image for error handling
const FALLBACK_IMAGE = '/images/project-placeholder.svg';

export const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  description,
  imageUrl,
  tags,
  views,
  onView,
  imageSlot,
  viewMode = 'optimistic',
}) => {
  const [imageError, setImageError] = useState(false);
  const [viewCount, setViewCount] = useState(views);
  const [isIncrementing, setIsIncrementing] = useState(false);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleViewClick = useCallback(async () => {
    // Prevent double-clicks
    if (isIncrementing) return;

    setIsIncrementing(true);

    // Optimistic update
    if (viewMode === 'optimistic') {
      setViewCount((prev) => prev + 1);
    }

    try {
      const result = await incrementProjectView(id, viewMode);
      
      // Update with actual value from server if valid
      if (result.views >= 0) {
        setViewCount(result.views);
      }
    } catch (error) {
      // Rollback optimistic update on error
      if (viewMode === 'optimistic') {
        setViewCount((prev) => prev - 1);
      }
      console.error('Failed to increment view:', error);
    } finally {
      setIsIncrementing(false);
    }

    // Call the external onView handler if provided
    onView?.();
  }, [id, viewMode, isIncrementing, onView]);

  const displayedImageUrl = imageError ? FALLBACK_IMAGE : imageUrl;

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-2xl dark:bg-gray-800"
      aria-label={`Project: ${title}`}
    >
      {/* Image Section with Gradient Overlay */}
      <div className="relative h-48 w-full overflow-hidden sm:h-56 md:h-64">
        {imageSlot || (
          <div className="relative h-full w-full">
            <Image
              src={displayedImageUrl}
              alt={`${title} project preview`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-110"
              onError={handleImageError}
              priority={false}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIRAAAgEEAgIDAAAAAAAAAAAAAQIDAAQFERIhBjEiQWH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBf/EABkRAAMAAwAAAAAAAAAAAAAAAAABAgQRIf/aAAwDAQACEQMRAD8AmZTKy4vIy28EELPA5jfijFkIPS6IBPYHvVVP49K0lsbWW3kkuUl5yS810zkAAnQBbY1v5SlBMhtnS8h0f//Z"
            />
          </div>
        )}
        {/* Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90"
          aria-hidden="true"
        />

        {/* Title and Views Overlay on Image */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <h3 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
            {title}
          </h3>
          {/* View Counter Badge */}
          <div className="mt-2 flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm"
              aria-label={`${viewCount.toLocaleString()} views`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {viewCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-4 sm:p-6">
        {/* Description */}
        <p className="mb-4 line-clamp-3 flex-1 text-sm text-gray-600 dark:text-gray-300 sm:text-base">
          {description}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2" role="list" aria-label="Project tags">
            {tags.map((tag) => (
              <span
                key={tag}
                role="listitem"
                className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1 text-xs font-medium text-white transition-all duration-200 hover:shadow-lg sm:text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* View Button */}
        <button
          onClick={handleViewClick}
          disabled={isIncrementing}
          aria-label={`View details of ${title} project`}
          aria-busy={isIncrementing}
          className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 dark:focus:ring-offset-gray-800"
        >
          {isIncrementing ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-5 w-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading...
            </span>
          ) : (
            'View Project'
          )}
        </button>
      </div>
    </article>
  );
};
