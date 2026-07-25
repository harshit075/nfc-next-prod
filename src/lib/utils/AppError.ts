/**
 * Operational Error class representing client-facing or system errors
 * that have defined HTTP status codes and predictable messages.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  /**
   * Constructs an AppError instance.
   * 
   * @param {string} message - User-friendly error message.
   * @param {number} statusCode - HTTP status code (e.g. 400, 401, 404, 500).
   * @param {boolean} isOperational - Indicates if the error is operational (expected) or programming/system failure.
   */
  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
