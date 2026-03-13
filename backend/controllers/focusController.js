const { recordSession, getSessionHistory, getProgression, getStats } = require("../models/focusModel");

/**
 * Records a completed focus session for the authenticated user.
 * @param {import("express").Request & { user: object }} request The HTTP request.
 * @param {import("express").Response} response The HTTP response.
 * @param {import("express").NextFunction} next The next middleware function.
 * @returns {Promise<void>}
 */
async function createFocusSession(request, response, next) {
  try {
    const { durationMinutes } = request.body;
    const result = await recordSession(request.user.id, durationMinutes);

    response.status(201).json({ data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * Returns the focus session history for the authenticated user.
 * @param {import("express").Request & { user: object }} request The HTTP request.
 * @param {import("express").Response} response The HTTP response.
 * @param {import("express").NextFunction} next The next middleware function.
 * @returns {Promise<void>}
 */
async function getFocusHistory(request, response, next) {
  try {
    const sessions = await getSessionHistory(request.user.id);
    response.status(200).json({ data: sessions });
  } catch (error) {
    next(error);
  }
}

/**
 * Returns the XP, level, and badge progression for the authenticated user.
 * @param {import("express").Request & { user: object }} request The HTTP request.
 * @param {import("express").Response} response The HTTP response.
 * @param {import("express").NextFunction} next The next middleware function.
 * @returns {Promise<void>}
 */
async function getFocusProgression(request, response, next) {
  try {
    const progression = await getProgression(request.user.id);
    response.status(200).json({ data: progression });
  } catch (error) {
    next(error);
  }
}

/**
 * Returns weekly and monthly focus statistics for the authenticated user.
 * @param {import("express").Request & { user: object }} request The HTTP request.
 * @param {import("express").Response} response The HTTP response.
 * @param {import("express").NextFunction} next The next middleware function.
 * @returns {Promise<void>}
 */
async function getFocusStats(request, response, next) {
  try {
    const stats = await getStats(request.user.id);
    response.status(200).json({ data: stats });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createFocusSession,
  getFocusHistory,
  getFocusProgression,
  getFocusStats,
};
