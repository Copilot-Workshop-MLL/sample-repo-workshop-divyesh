const express = require("express");
const { body, param, query } = require("express-validator");
const {
  createEmployee,
  deleteEmployee,
  getEmployee,
  getEmployees,
  updateEmployee,
} = require("../controllers/employeeController");
const { requireAuth } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");

const router = express.Router();

/**
 * Returns the shared validation rules for employee payloads.
 * @returns {Array<import("express-validator").ValidationChain>} The employee validation rules.
 */
function employeePayloadValidators() {
  return [
    body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters."),
    body("email").trim().isEmail().withMessage("A valid email address is required."),
    body("department")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Department must be between 2 and 100 characters."),
    body("role").trim().isLength({ min: 2, max: 100 }).withMessage("Role must be between 2 and 100 characters."),
    body("hireDate").isISO8601().withMessage("Hire date must be a valid ISO 8601 date."),
    body("salary")
      .isFloat({ min: 0 })
      .withMessage("Salary must be a non-negative number.")
      .toFloat(),
  ];
}

router.use(requireAuth);

router.get(
  "/",
  [
    query("department").optional().trim().isLength({ max: 100 }),
    query("role").optional().trim().isLength({ max: 100 }),
    query("search").optional().trim().isLength({ max: 100 }),
    validateRequest,
  ],
  getEmployees
);

router.post("/", [...employeePayloadValidators(), validateRequest], createEmployee);

router.get(
  "/:id",
  [param("id").trim().notEmpty().withMessage("Employee id is required."), validateRequest],
  getEmployee
);

router.put(
  "/:id",
  [param("id").trim().notEmpty().withMessage("Employee id is required."), ...employeePayloadValidators(), validateRequest],
  updateEmployee
);

router.delete(
  "/:id",
  [param("id").trim().notEmpty().withMessage("Employee id is required."), validateRequest],
  deleteEmployee
);

module.exports = router;
