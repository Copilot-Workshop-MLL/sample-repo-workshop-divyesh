const app = require("./app");
const { isDatabaseEnabled } = require("./config/db");

const port = Number(process.env.PORT || 5000);

/**
 * Starts the backend HTTP server.
 * @returns {import("http").Server} The running HTTP server.
 */
function startServer() {
  return app.listen(port, () => {
    console.log(
      `Employee Management API listening on port ${port} using ${isDatabaseEnabled() ? "PostgreSQL" : "in-memory"} persistence.`
    );
  });
}

if (require.main === module) {
  startServer();
}

module.exports = {
  startServer,
};
