/**
 * Application Layer Error
 *
 * Custom error class thrown when a project is not found
 */
export class ProjectNotFoundError extends Error {
  constructor(
    public readonly projectId: string,
    message?: string,
  ) {
    super(message || `Project with ID ${projectId} not found`);
    this.name = 'ProjectNotFoundError';

    // Maintain proper stack trace (only available in V8 engines like Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ProjectNotFoundError);
    }
  }
}
