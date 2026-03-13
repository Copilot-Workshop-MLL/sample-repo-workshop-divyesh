/**
 * Builds an HTTP error object with a status code.
 * @param {number} statusCode The HTTP status code.
 * @param {string} message The error message.
 * @returns {Error & { statusCode: number }} The enriched error object.
 */
function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Handles unknown routes.
 * @param {import("express").Request} request The HTTP request.
 * @param {import("express").Response} _response The HTTP response.
 * @param {import("express").NextFunction} next The next middleware function.
 * @returns {void}
 */
function notFoundHandler(request, _response, next) {
  next(createError(404, `Route not found: ${request.method} ${request.originalUrl}`));
}

/**
 * Formats application errors into a consistent JSON response.
 * @param {Error & { statusCode?: number }} error The error that occurred.
 * @param {import("express").Request} _request The HTTP request.
 * @param {import("express").Response} response The HTTP response.
 * @param {import("express").NextFunction} _next The next middleware function.
 * @returns {void}
 */
function errorHandler(error, _request, response, _next) {
  const statusCode = error.statusCode || 500;

  response.status(statusCode).json({
    message: error.message || "An unexpected error occurred.",
    ...(process.env.NODE_ENV === "production" ? {} : { stack: error.stack }),
  });
}

module.exports = {
  createError,
  errorHandler,
  notFoundHandler,
};
