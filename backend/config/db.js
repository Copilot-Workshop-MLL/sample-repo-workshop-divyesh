const { Pool } = require("pg");

let pool;

/**
 * Returns true when PostgreSQL should be used for persistence.
 * @returns {boolean} Whether PostgreSQL is enabled.
 */
function isDatabaseEnabled() {
  return Boolean(process.env.DATABASE_URL) && process.env.USE_MEMORY_DB !== "true";
}

/**
 * Lazily creates and returns the PostgreSQL pool.
 * @returns {Pool | null} A PostgreSQL pool when configured, otherwise null.
 */
function getPool() {
  if (!isDatabaseEnabled()) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });

    pool.on("error", (error) => {
      console.error("Unexpected PostgreSQL error", error);
    });
  }

  return pool;
}

/**
 * Executes a SQL query against PostgreSQL.
 * @param {string} text The SQL statement.
 * @param {Array<unknown>} [params] The prepared statement parameters.
 * @returns {Promise<import("pg").QueryResult>} The query result.
 */
async function query(text, params = []) {
  const activePool = getPool();

  if (!activePool) {
    throw new Error("PostgreSQL is not configured for this environment.");
  }

  return activePool.query(text, params);
}

module.exports = {
  getPool,
  isDatabaseEnabled,
  query,
};
