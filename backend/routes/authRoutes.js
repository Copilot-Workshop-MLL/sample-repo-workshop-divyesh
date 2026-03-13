const express = require("express");
const { body } = require("express-validator");
const { getCurrentUser, login, logout } = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");

const router = express.Router();

router.post(
  "/login",
  [
    body("email").trim().isEmail().withMessage("A valid email address is required."),
    body("password").isLength({ min: 6 }).withMessage("A password with at least 6 characters is required."),
    validateRequest,
  ],
  login
);

router.get("/me", requireAuth, getCurrentUser);
router.post("/logout", requireAuth, logout);

module.exports = router;
