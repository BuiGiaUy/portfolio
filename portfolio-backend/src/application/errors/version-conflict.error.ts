/**
 * Application Layer Error
 *
 * Custom error class thrown when a version conflict occurs
 * during optimistic locking
 */
export class VersionConflictError extends Error {
  constructor(
    public readonly projectId: string,
    message?: string,
  ) {
    super(
      message ||
        `Version conflict occurred for project ${projectId}. The project was modified by another process.`,
    );
    this.name = 'VersionConflictError';

    // Maintain proper stack trace (only available in V8 engines like Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, VersionConflictError);
    }
  }
}
