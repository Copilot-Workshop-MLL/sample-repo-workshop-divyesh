const express = require("express");
const rateLimit = require("express-rate-limit");
const { body } = require("express-validator");
const {
  createFocusSession,
  getFocusHistory,
  getFocusProgression,
  getFocusStats,
} = require("../controllers/focusController");
const { requireAuth } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");

const router = express.Router();

const focusRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

router.post(
  "/sessions",
  focusRateLimiter,
  requireAuth,
  [
    body("durationMinutes")
      .isInt({ min: 1 })
      .withMessage("durationMinutes must be a positive integer."),
    validateRequest,
  ],
  createFocusSession
);

router.get("/sessions", focusRateLimiter, requireAuth, getFocusHistory);
router.get("/progression", focusRateLimiter, requireAuth, getFocusProgression);
router.get("/stats", focusRateLimiter, requireAuth, getFocusStats);

module.exports = router;
