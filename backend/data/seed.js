const bcrypt = require("bcryptjs");

const defaultUsers = [
  {
    id: "user-admin-1",
    name: "System Admin",
    email: "admin@example.com",
    passwordHash: bcrypt.hashSync("admin123", 10),
    role: "admin",
  },
];

const defaultFocusSessions = [];

const defaultUserProgression = [
  {
    userId: "user-admin-1",
    xp: 0,
    level: 1,
    badges: [],
  },
];

const defaultEmployees = [
  {
    id: "emp-1001",
    name: "Avery Stone",
    email: "avery.stone@example.com",
    department: "Engineering",
    role: "Frontend Engineer",
    hireDate: "2022-03-01",
    salary: 92000,
  },
  {
    id: "emp-1002",
    name: "Miles Carter",
    email: "miles.carter@example.com",
    department: "Engineering",
    role: "Backend Engineer",
    hireDate: "2021-11-15",
    salary: 104000,
  },
  {
    id: "emp-1003",
    name: "Priya Shah",
    email: "priya.shah@example.com",
    department: "People",
    role: "HR Manager",
    hireDate: "2020-06-20",
    salary: 86000,
  },
  {
    id: "emp-1004",
    name: "Lena Brooks",
    email: "lena.brooks@example.com",
    department: "Finance",
    role: "Financial Analyst",
    hireDate: "2023-01-09",
    salary: 78000,
  },
  {
    id: "emp-1005",
    name: "Owen Patel",
    email: "owen.patel@example.com",
    department: "Operations",
    role: "Operations Lead",
    hireDate: "2019-09-30",
    salary: 99000,
  },
];

/**
 * Creates a fresh copy of the seed data for the in-memory store.
 * @returns {{ users: Array<object>, employees: Array<object>, focusSessions: Array<object>, userProgression: Array<object> }} A deep copy of the seed data.
 */
function createSeedState() {
  return {
    users: defaultUsers.map((user) => ({ ...user })),
    employees: defaultEmployees.map((employee) => ({ ...employee })),
    focusSessions: defaultFocusSessions.map((session) => ({ ...session })),
    userProgression: defaultUserProgression.map((progression) => ({
      ...progression,
      badges: [...progression.badges],
    })),
  };
}

module.exports = {
  createSeedState,
};
