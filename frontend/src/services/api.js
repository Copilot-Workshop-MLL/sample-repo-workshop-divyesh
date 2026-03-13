import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Builds the authorization config for protected requests.
 * @param {string} token The bearer token.
 * @returns {{ headers: { Authorization: string } }} The axios request config.
 */
function getAuthConfig(token) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

/**
 * Extracts the best available API error message.
 * @param {unknown} error The thrown API error.
 * @returns {string} The resolved error message.
 */
export function getApiErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.message ||
      error.message ||
      "The request could not be completed."
    );
  }

  return error instanceof Error ? error.message : "The request could not be completed.";
}

/**
 * Authenticates a user.
 * @param {{ email: string, password: string }} credentials The login payload.
 * @returns {Promise<{ token: string, user: object }>} The authenticated session.
 */
export async function loginUser(credentials) {
  const response = await apiClient.post("/auth/login", credentials);
  return response.data.data;
}

/**
 * Logs the current user out.
 * @param {string} token The bearer token.
 * @returns {Promise<void>} A resolved promise when logout succeeds.
 */
export async function logoutUser(token) {
  await apiClient.post("/auth/logout", {}, getAuthConfig(token));
}

/**
 * Fetches employees matching the current filters.
 * @param {string} token The bearer token.
 * @param {{ department?: string, role?: string, search?: string }} filters The filter payload.
 * @returns {Promise<{ data: Array<object>, meta: { total: number } }>} The employee list response.
 */
export async function fetchEmployees(token, filters) {
  const response = await apiClient.get("/employees", {
    ...getAuthConfig(token),
    params: filters,
  });

  return response.data;
}

/**
 * Creates a new employee.
 * @param {string} token The bearer token.
 * @param {{ name: string, email: string, department: string, role: string, hireDate: string, salary: number }} payload The employee payload.
 * @returns {Promise<object>} The created employee.
 */
export async function createEmployee(token, payload) {
  const response = await apiClient.post("/employees", payload, getAuthConfig(token));
  return response.data.data;
}

/**
 * Updates an existing employee.
 * @param {string} token The bearer token.
 * @param {string} employeeId The employee identifier.
 * @param {{ name: string, email: string, department: string, role: string, hireDate: string, salary: number }} payload The updated payload.
 * @returns {Promise<object>} The updated employee.
 */
export async function updateEmployee(token, employeeId, payload) {
  const response = await apiClient.put(`/employees/${employeeId}`, payload, getAuthConfig(token));
  return response.data.data;
}

/**
 * Deletes an employee.
 * @param {string} token The bearer token.
 * @param {string} employeeId The employee identifier.
 * @returns {Promise<void>} A resolved promise when deletion succeeds.
 */
export async function deleteEmployee(token, employeeId) {
  await apiClient.delete(`/employees/${employeeId}`, getAuthConfig(token));
}

/**
 * Fetches the dashboard statistics.
 * @param {string} token The bearer token.
 * @returns {Promise<object>} The dashboard statistics.
 */
export async function fetchDashboardStats(token) {
  const response = await apiClient.get("/dashboard/stats", getAuthConfig(token));
  return response.data.data;
}

/**
 * Records a completed focus session for the authenticated user.
 * @param {string} token The bearer token.
 * @param {number} durationMinutes The session duration in minutes.
 * @returns {Promise<{ session: object, progression: object }>} The saved session and updated progression.
 */
export async function recordFocusSession(token, durationMinutes) {
  const response = await apiClient.post(
    "/focus/sessions",
    { durationMinutes },
    getAuthConfig(token)
  );
  return response.data.data;
}

/**
 * Fetches the focus session history for the authenticated user.
 * @param {string} token The bearer token.
 * @returns {Promise<Array<object>>} The session list.
 */
export async function fetchFocusSessions(token) {
  const response = await apiClient.get("/focus/sessions", getAuthConfig(token));
  return response.data.data;
}

/**
 * Fetches the XP, level, and badge progression for the authenticated user.
 * @param {string} token The bearer token.
 * @returns {Promise<{ xp: number, level: number, badges: Array<string> }>} The progression data.
 */
export async function fetchFocusProgression(token) {
  const response = await apiClient.get("/focus/progression", getAuthConfig(token));
  return response.data.data;
}

/**
 * Fetches the weekly and monthly focus statistics for the authenticated user.
 * @param {string} token The bearer token.
 * @returns {Promise<{ totalSessions: number, weekly: Array<object>, monthly: Array<object> }>} The stats data.
 */
export async function fetchFocusStats(token) {
  const response = await apiClient.get("/focus/stats", getAuthConfig(token));
  return response.data.data;
}
