const { validationResult } = require("express-validator");

/**
 * Stops the request when validation errors are present.
 * @param {import("express").Request} request The HTTP request.
 * @param {import("express").Response} response The HTTP response.
 * @param {import("express").NextFunction} next The next middleware function.
 * @returns {void}
 */
function validateRequest(request, response, next) {
  const result = validationResult(request);

  if (!result.isEmpty()) {
    response.status(400).json({
      message: "Validation failed.",
      errors: result.array().map((issue) => ({
        field: issue.path,
        message: issue.msg,
      })),
    });
    return;
  }

  next();
}

module.exports = {
  validateRequest,
};
