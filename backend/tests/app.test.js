process.env.USE_MEMORY_DB = "true";
process.env.JWT_SECRET = "test-secret";
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const { resetMemoryState } = require("../data/memoryStore");

/**
 * Logs in with the seeded admin account and returns the bearer token.
 * @returns {Promise<string>} A valid bearer token.
 */
async function loginAndGetToken() {
  const response = await request(app).post("/api/auth/login").send({
    email: "admin@example.com",
    password: "admin123",
  });

  return response.body.data.token;
}

describe("Employee Management API", () => {
  beforeEach(() => {
    resetMemoryState();
  });

  test("GET /api/health returns the API status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.persistence).toBe("memory");
  });

  test("POST /api/auth/login returns a token for valid credentials", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "admin123",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.user.email).toBe("admin@example.com");
    expect(response.body.data.token).toEqual(expect.any(String));
  });

  test("GET /api/employees requires authentication", async () => {
    const response = await request(app).get("/api/employees");
    expect(response.statusCode).toBe(401);
  });

  test("employee CRUD flow works end to end", async () => {
    const token = await loginAndGetToken();

    const createResponse = await request(app)
      .post("/api/employees")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Jordan Lee",
        email: "jordan.lee@example.com",
        department: "Engineering",
        role: "QA Engineer",
        hireDate: "2024-07-15",
        salary: 88000,
      });

    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.body.data.name).toBe("Jordan Lee");

    const employeeId = createResponse.body.data.id;

    const updateResponse = await request(app)
      .put(`/api/employees/${employeeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Jordan Lee",
        email: "jordan.lee@example.com",
        department: "Engineering",
        role: "Senior QA Engineer",
        hireDate: "2024-07-15",
        salary: 93000,
      });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body.data.role).toBe("Senior QA Engineer");

    const filteredResponse = await request(app)
      .get("/api/employees")
      .set("Authorization", `Bearer ${token}`)
      .query({ role: "Senior QA Engineer" });

    expect(filteredResponse.statusCode).toBe(200);
    expect(filteredResponse.body.meta.total).toBe(1);

    const deleteResponse = await request(app)
      .delete(`/api/employees/${employeeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteResponse.statusCode).toBe(200);
  });

  test("GET /api/dashboard/stats returns employee statistics", async () => {
    const token = await loginAndGetToken();
    const response = await request(app)
      .get("/api/dashboard/stats")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.totalEmployees).toBeGreaterThan(0);
    expect(response.body.data.departments).toEqual(expect.any(Array));
    expect(response.body.data.roles).toEqual(expect.any(Array));
  });
});
