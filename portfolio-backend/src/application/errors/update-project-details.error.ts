/**
 * Application Layer Error
 *
 * Custom error class for wrapping low-level errors from the
 * UpdateProjectDetails use case.
 */
export class UpdateProjectDetailsError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = 'UpdateProjectDetailsError';

    // Maintain proper stack trace (only available in V8 engines like Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UpdateProjectDetailsError);
    }
  }
}
