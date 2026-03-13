const { getEmployeeStatistics } = require("../models/employeeModel");

/**
 * Returns the employee dashboard statistics.
 * @param {import("express").Request} _request The HTTP request.
 * @param {import("express").Response} response The HTTP response.
 * @param {import("express").NextFunction} next The next middleware function.
 * @returns {Promise<void>}
 */
async function getDashboardStats(_request, response, next) {
  try {
    const stats = await getEmployeeStatistics();

    response.status(200).json({
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardStats,
};
