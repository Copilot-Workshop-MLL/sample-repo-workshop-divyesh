require("dotenv").config();

const cors = require("cors");
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const { isDatabaseEnabled } = require("./config/db");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

/**
 * Builds the CORS configuration from environment variables.
 * @returns {{ origin: boolean | Array<string> }} The CORS options.
 */
function getCorsOptions() {
  const configuredOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (!configuredOrigins.length) {
    return { origin: true };
  }

  return {
    origin: configuredOrigins,
  };
}

/**
 * Returns an API health payload.
 * @param {import("express").Request} _request The HTTP request.
 * @param {import("express").Response} response The HTTP response.
 * @returns {void}
 */
function getHealthStatus(_request, response) {
  response.status(200).json({
    status: "ok",
    persistence: isDatabaseEnabled() ? "postgres" : "memory",
    timestamp: new Date().toISOString(),
  });
}

app.disable("x-powered-by");
app.use(cors(getCorsOptions()));
app.use(express.json());

app.get("/api/health", getHealthStatus);
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
