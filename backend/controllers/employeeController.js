const {
  createEmployeeRecord,
  deleteEmployeeRecord,
  getEmployeeById,
  listEmployees,
  updateEmployeeRecord,
} = require("../models/employeeModel");
const { createError } = require("../middleware/errorHandler");

/**
 * Lists employees with optional filters.
 * @param {import("express").Request} request The HTTP request.
 * @param {import("express").Response} response The HTTP response.
 * @param {import("express").NextFunction} next The next middleware function.
 * @returns {Promise<void>}
 */
async function getEmployees(request, response, next) {
  try {
    const employees = await listEmployees(request.query);

    response.status(200).json({
      data: employees,
      meta: {
        total: employees.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Returns a single employee.
 * @param {import("express").Request} request The HTTP request.
 * @param {import("express").Response} response The HTTP response.
 * @param {import("express").NextFunction} next The next middleware function.
 * @returns {Promise<void>}
 */
async function getEmployee(request, response, next) {
  try {
    const employee = await getEmployeeById(request.params.id);

    if (!employee) {
      throw createError(404, "Employee not found.");
    }

    response.status(200).json({
      data: employee,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Creates a new employee.
 * @param {import("express").Request} request The HTTP request.
 * @param {import("express").Response} response The HTTP response.
 * @param {import("express").NextFunction} next The next middleware function.
 * @returns {Promise<void>}
 */
async function createEmployee(request, response, next) {
  try {
    const employee = await createEmployeeRecord(request.body);

    response.status(201).json({
      message: "Employee created successfully.",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Updates an existing employee.
 * @param {import("express").Request} request The HTTP request.
 * @param {import("express").Response} response The HTTP response.
 * @param {import("express").NextFunction} next The next middleware function.
 * @returns {Promise<void>}
 */
async function updateEmployee(request, response, next) {
  try {
    const employee = await updateEmployeeRecord(request.params.id, request.body);

    if (!employee) {
      throw createError(404, "Employee not found.");
    }

    response.status(200).json({
      message: "Employee updated successfully.",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Deletes an employee.
 * @param {import("express").Request} request The HTTP request.
 * @param {import("express").Response} response The HTTP response.
 * @param {import("express").NextFunction} next The next middleware function.
 * @returns {Promise<void>}
 */
async function deleteEmployee(request, response, next) {
  try {
    const deleted = await deleteEmployeeRecord(request.params.id);

    if (!deleted) {
      throw createError(404, "Employee not found.");
    }

    response.status(200).json({
      message: "Employee deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createEmployee,
  deleteEmployee,
  getEmployee,
  getEmployees,
  updateEmployee,
};
