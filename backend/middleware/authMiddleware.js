const jwt = require("jsonwebtoken");
const { getUserById } = require("../models/userModel");
const { createError } = require("./errorHandler");

/**
 * Validates the bearer token and attaches the authenticated user.
 * @param {import("express").Request & { user?: object }} request The HTTP request.
 * @param {import("express").Response} _response The HTTP response.
 * @param {import("express").NextFunction} next The next middleware function.
 * @returns {Promise<void>}
 */
async function requireAuth(request, _response, next) {
  try {
    const authorizationHeader = request.headers.authorization || "";
    const [scheme, token] = authorizationHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw createError(401, "Authentication is required.");
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || "development-secret");
    const user = await getUserById(payload.sub);

    if (!user) {
      throw createError(401, "The authenticated user no longer exists.");
    }

    request.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (!error.statusCode) {
      next(createError(401, "The provided token is invalid or expired."));
      return;
    }

    next(error);
  }
}

module.exports = {
  requireAuth,
};
