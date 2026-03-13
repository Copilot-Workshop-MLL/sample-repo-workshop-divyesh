const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { findUserByEmail } = require("../models/userModel");
const { createError } = require("../middleware/errorHandler");

/**
 * Creates the public user payload returned to the client.
 * @param {{ id: string, name: string, email: string, role: string }} user The authenticated user.
 * @returns {{ id: string, name: string, email: string, role: string }} The public user payload.
 */
function buildPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

/**
 * Signs a JWT for the authenticated user.
 * @param {{ id: string, name: string, email: string, role: string }} user The authenticated user.
 * @returns {string} The signed JWT.
 */
function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET || "development-secret",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "8h",
    }
  );
}

/**
 * Authenticates a user with email and password.
 * @param {import("express").Request} request The HTTP request.
 * @param {import("express").Response} response The HTTP response.
 * @param {import("express").NextFunction} next The next middleware function.
 * @returns {Promise<void>}
 */
async function login(request, response, next) {
  try {
    const user = await findUserByEmail(request.body.email);

    if (!user) {
      throw createError(401, "Invalid email or password.");
    }

    const passwordMatches = await bcrypt.compare(request.body.password, user.passwordHash);

    if (!passwordMatches) {
      throw createError(401, "Invalid email or password.");
    }

    response.status(200).json({
      message: "Login successful.",
      data: {
        token: createToken(user),
        user: buildPublicUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Returns the authenticated user profile.
 * @param {import("express").Request & { user?: object }} request The HTTP request.
 * @param {import("express").Response} response The HTTP response.
 * @returns {void}
 */
function getCurrentUser(request, response) {
  response.status(200).json({
    data: request.user,
  });
}

/**
 * Acknowledges logout for the stateless JWT flow.
 * @param {import("express").Request} _request The HTTP request.
 * @param {import("express").Response} response The HTTP response.
 * @returns {void}
 */
function logout(_request, response) {
  response.status(200).json({
    message: "Logout successful. Clear the stored token on the client to end the session.",
  });
}

module.exports = {
  getCurrentUser,
  login,
  logout,
};
