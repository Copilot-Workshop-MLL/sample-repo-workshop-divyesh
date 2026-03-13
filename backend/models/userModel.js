const { getMemoryState } = require("../data/memoryStore");
const { isDatabaseEnabled, query } = require("../config/db");

/**
 * Clones a user record to prevent accidental mutation.
 * @param {{ id: string, name: string, email: string, passwordHash: string, role: string }} user The source user.
 * @returns {{ id: string, name: string, email: string, passwordHash: string, role: string }} A cloned user object.
 */
function cloneUser(user) {
  return { ...user };
}

/**
 * Converts a PostgreSQL row into the app user shape.
 * @param {{ id: string, name: string, email: string, passwordHash: string, role: string }} row The database row.
 * @returns {{ id: string, name: string, email: string, passwordHash: string, role: string }} The mapped user.
 */
function mapUserRow(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.passwordHash,
    role: row.role,
  };
}

/**
 * Finds a user by email address.
 * @param {string} email The email to search for.
 * @returns {Promise<object | null>} The matching user or null.
 */
async function findUserByEmail(email) {
  if (isDatabaseEnabled()) {
    const result = await query(
      "SELECT id, name, email, password_hash AS \"passwordHash\", role FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [email]
    );

    return result.rows[0] ? mapUserRow(result.rows[0]) : null;
  }

  const user = getMemoryState().users.find(
    (entry) => entry.email.toLowerCase() === email.toLowerCase()
  );

  return user ? cloneUser(user) : null;
}

/**
 * Finds a user by identifier.
 * @param {string} id The user identifier.
 * @returns {Promise<object | null>} The matching user or null.
 */
async function getUserById(id) {
  if (isDatabaseEnabled()) {
    const result = await query(
      "SELECT id, name, email, password_hash AS \"passwordHash\", role FROM users WHERE id = $1 LIMIT 1",
      [id]
    );

    return result.rows[0] ? mapUserRow(result.rows[0]) : null;
  }

  const user = getMemoryState().users.find((entry) => entry.id === id);
  return user ? cloneUser(user) : null;
}

module.exports = {
  findUserByEmail,
  getUserById,
};
