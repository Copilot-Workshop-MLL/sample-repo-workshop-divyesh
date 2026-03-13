process.env.USE_MEMORY_DB = "true";
process.env.JWT_SECRET = "test-secret";
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const { resetMemoryState } = require("../data/memoryStore");
const { calculateLevel, computeEarnedBadges, XP_PER_SESSION } = require("../models/focusModel");

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

describe("Focus Gamification API", () => {
  beforeEach(() => {
    resetMemoryState();
  });

  describe("XP and level calculation", () => {
    test(`XP_PER_SESSION is ${XP_PER_SESSION}`, () => {
      expect(XP_PER_SESSION).toBe(10);
    });

    test("calculateLevel returns 1 for 0 XP", () => {
      expect(calculateLevel(0)).toBe(1);
    });

    test("calculateLevel returns 1 for 49 XP", () => {
      expect(calculateLevel(49)).toBe(1);
    });

    test("calculateLevel returns 2 for 50 XP", () => {
      expect(calculateLevel(50)).toBe(2);
    });

    test("calculateLevel returns 3 for 150 XP", () => {
      expect(calculateLevel(150)).toBe(3);
    });

    test("calculateLevel returns 4 for 300 XP", () => {
      expect(calculateLevel(300)).toBe(4);
    });

    test("calculateLevel returns 5 for 500 XP", () => {
      expect(calculateLevel(500)).toBe(5);
    });
  });

  describe("Badge rules", () => {
    function makeSession(daysAgo) {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return { completedAt: d.toISOString() };
    }

    test("first_session badge is awarded after one session", () => {
      const badges = computeEarnedBadges([makeSession(0)], 1);
      expect(badges).toContain("first_session");
    });

    test("first_session badge is not awarded with no sessions", () => {
      const badges = computeEarnedBadges([], 1);
      expect(badges).not.toContain("first_session");
    });

    test("streak_3 badge is awarded for 3 consecutive days", () => {
      const sessions = [makeSession(0), makeSession(1), makeSession(2)];
      const badges = computeEarnedBadges(sessions, 1);
      expect(badges).toContain("streak_3");
    });

    test("streak_3 badge is not awarded for non-consecutive days", () => {
      const sessions = [makeSession(0), makeSession(2), makeSession(4)];
      const badges = computeEarnedBadges(sessions, 1);
      expect(badges).not.toContain("streak_3");
    });

    test("weekly_10 badge is awarded for 10 sessions in the last 7 days", () => {
      const sessions = Array.from({ length: 10 }, (_, i) => makeSession(i % 6));
      const badges = computeEarnedBadges(sessions, 1);
      expect(badges).toContain("weekly_10");
    });

    test("weekly_10 badge is not awarded when fewer than 10 sessions this week", () => {
      const sessions = Array.from({ length: 9 }, (_, i) => makeSession(i));
      const badges = computeEarnedBadges(sessions, 1);
      expect(badges).not.toContain("weekly_10");
    });

    test("focus_master badge is awarded at level 5", () => {
      const sessions = Array.from({ length: 1 }, (_, i) => makeSession(i));
      const badges = computeEarnedBadges(sessions, 5);
      expect(badges).toContain("focus_master");
    });
  });

  describe("Focus session API endpoints", () => {
    test("POST /api/focus/sessions requires authentication", async () => {
      const response = await request(app)
        .post("/api/focus/sessions")
        .send({ durationMinutes: 25 });
      expect(response.statusCode).toBe(401);
    });

    test("POST /api/focus/sessions validates durationMinutes", async () => {
      const token = await loginAndGetToken();
      const response = await request(app)
        .post("/api/focus/sessions")
        .set("Authorization", `Bearer ${token}`)
        .send({ durationMinutes: 0 });
      expect(response.statusCode).toBe(400);
    });

    test("POST /api/focus/sessions records a session and awards XP", async () => {
      const token = await loginAndGetToken();
      const response = await request(app)
        .post("/api/focus/sessions")
        .set("Authorization", `Bearer ${token}`)
        .send({ durationMinutes: 25 });

      expect(response.statusCode).toBe(201);
      expect(response.body.data.session.durationMinutes).toBe(25);
      expect(response.body.data.progression.xp).toBe(XP_PER_SESSION);
    });

    test("GET /api/focus/sessions returns session history", async () => {
      const token = await loginAndGetToken();
      await request(app)
        .post("/api/focus/sessions")
        .set("Authorization", `Bearer ${token}`)
        .send({ durationMinutes: 25 });

      const response = await request(app)
        .get("/api/focus/sessions")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].durationMinutes).toBe(25);
    });

    test("GET /api/focus/progression returns XP and level", async () => {
      const token = await loginAndGetToken();
      const response = await request(app)
        .get("/api/focus/progression")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.xp).toBe(0);
      expect(response.body.data.level).toBe(1);
      expect(response.body.data.badges).toEqual([]);
    });

    test("GET /api/focus/stats returns weekly and monthly aggregates", async () => {
      const token = await loginAndGetToken();
      await request(app)
        .post("/api/focus/sessions")
        .set("Authorization", `Bearer ${token}`)
        .send({ durationMinutes: 25 });

      const response = await request(app)
        .get("/api/focus/stats")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.totalSessions).toBe(1);
      expect(response.body.data.weekly).toEqual(expect.any(Array));
      expect(response.body.data.monthly).toEqual(expect.any(Array));
    });

    test("completing multiple sessions updates level", async () => {
      const token = await loginAndGetToken();

      for (let i = 0; i < 5; i++) {
        await request(app)
          .post("/api/focus/sessions")
          .set("Authorization", `Bearer ${token}`)
          .send({ durationMinutes: 25 });
      }

      const response = await request(app)
        .get("/api/focus/progression")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.xp).toBe(50);
      expect(response.body.data.level).toBe(2);
      expect(response.body.data.badges).toContain("first_session");
    });
  });
});
