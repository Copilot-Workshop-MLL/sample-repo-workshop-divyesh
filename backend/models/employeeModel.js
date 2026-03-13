const { randomUUID } = require("crypto");
const { getMemoryState } = require("../data/memoryStore");
const { isDatabaseEnabled, query } = require("../config/db");

/**
 * Normalizes the filter values used by the employee list.
 * @param {{ department?: string, role?: string, search?: string }} filters The incoming filters.
 * @returns {{ department: string, role: string, search: string }} The normalized filters.
 */
function normalizeFilters(filters = {}) {
  return {
    department: (filters.department || "").trim(),
    role: (filters.role || "").trim(),
    search: (filters.search || "").trim(),
  };
}

/**
 * Converts a PostgreSQL row into the app employee shape.
 * @param {{ id: string, name: string, email: string, department: string, role: string, hireDate?: string, hire_date?: string, salary: number | string }} row The database row.
 * @returns {{ id: string, name: string, email: string, department: string, role: string, hireDate: string, salary: number }} The mapped employee.
 */
function mapEmployeeRow(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    department: row.department,
    role: row.role,
    hireDate: row.hireDate || row.hire_date,
    salary: Number(row.salary),
  };
}

/**
 * Creates a shallow clone of an employee object.
 * @param {{ id: string, name: string, email: string, department: string, role: string, hireDate: string, salary: number }} employee The source employee.
 * @returns {{ id: string, name: string, email: string, department: string, role: string, hireDate: string, salary: number }} The cloned employee.
 */
function cloneEmployee(employee) {
  return { ...employee };
}

/**
 * Builds the SQL WHERE clause for employee filters.
 * @param {{ department: string, role: string, search: string }} filters The normalized filters.
 * @returns {{ whereClause: string, values: Array<string> }} The SQL fragment and its values.
 */
function buildWhereClause(filters) {
  const clauses = [];
  const values = [];

  if (filters.department) {
    values.push(filters.department);
    clauses.push(`department ILIKE $${values.length}`);
  }

  if (filters.role) {
    values.push(filters.role);
    clauses.push(`role ILIKE $${values.length}`);
  }

  if (filters.search) {
    values.push(`%${filters.search}%`);
    const placeholder = `$${values.length}`;
    clauses.push(
      `(name ILIKE ${placeholder} OR email ILIKE ${placeholder} OR department ILIKE ${placeholder} OR role ILIKE ${placeholder})`
    );
  }

  return {
    whereClause: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    values,
  };
}

/**
 * Applies filters to the in-memory employee list.
 * @param {Array<object>} employees The source employee records.
 * @param {{ department: string, role: string, search: string }} filters The normalized filters.
 * @returns {Array<object>} The filtered employees.
 */
function filterEmployees(employees, filters) {
  const searchValue = filters.search.toLowerCase();

  return employees
    .filter((employee) => {
      if (filters.department && employee.department.toLowerCase() !== filters.department.toLowerCase()) {
        return false;
      }

      if (filters.role && employee.role.toLowerCase() !== filters.role.toLowerCase()) {
        return false;
      }

      if (!searchValue) {
        return true;
      }

      return [employee.name, employee.email, employee.department, employee.role].some((field) =>
        field.toLowerCase().includes(searchValue)
      );
    })
    .sort((left, right) => {
      if (left.hireDate === right.hireDate) {
        return left.name.localeCompare(right.name);
      }

      return right.hireDate.localeCompare(left.hireDate);
    })
    .map(cloneEmployee);
}

/**
 * Creates summary statistics for the employee dashboard.
 * @param {Array<object>} employees The employees to summarize.
 * @returns {{ totalEmployees: number, averageSalary: number, departments: Array<object>, roles: Array<object>, newestHire: object | null, highestSalary: object | null }} The computed statistics.
 */
function calculateStatistics(employees) {
  const departmentTotals = new Map();
  const roleTotals = new Map();

  employees.forEach((employee) => {
    departmentTotals.set(employee.department, (departmentTotals.get(employee.department) || 0) + 1);
    roleTotals.set(employee.role, (roleTotals.get(employee.role) || 0) + 1);
  });

  const totalSalary = employees.reduce((sum, employee) => sum + Number(employee.salary), 0);
  const sortedByHireDate = [...employees].sort((left, right) => right.hireDate.localeCompare(left.hireDate));
  const sortedBySalary = [...employees].sort((left, right) => Number(right.salary) - Number(left.salary));

  return {
    totalEmployees: employees.length,
    averageSalary: employees.length ? Math.round(totalSalary / employees.length) : 0,
    departments: [...departmentTotals.entries()].map(([name, total]) => ({ name, total })),
    roles: [...roleTotals.entries()].map(([name, total]) => ({ name, total })),
    newestHire: sortedByHireDate[0] || null,
    highestSalary: sortedBySalary[0] || null,
  };
}

/**
 * Lists employees matching the provided filters.
 * @param {{ department?: string, role?: string, search?: string }} filters The employee filters.
 * @returns {Promise<Array<object>>} The matching employees.
 */
async function listEmployees(filters = {}) {
  const normalizedFilters = normalizeFilters(filters);

  if (isDatabaseEnabled()) {
    const { whereClause, values } = buildWhereClause(normalizedFilters);
    const result = await query(
      `SELECT id, name, email, department, role, hire_date AS "hireDate", salary FROM employees ${whereClause} ORDER BY hire_date DESC, name ASC`,
      values
    );

    return result.rows.map(mapEmployeeRow);
  }

  return filterEmployees(getMemoryState().employees, normalizedFilters);
}

/**
 * Finds a single employee by identifier.
 * @param {string} id The employee identifier.
 * @returns {Promise<object | null>} The employee or null.
 */
async function getEmployeeById(id) {
  if (isDatabaseEnabled()) {
    const result = await query(
      'SELECT id, name, email, department, role, hire_date AS "hireDate", salary FROM employees WHERE id = $1 LIMIT 1',
      [id]
    );

    return result.rows[0] ? mapEmployeeRow(result.rows[0]) : null;
  }

  const employee = getMemoryState().employees.find((entry) => entry.id === id);
  return employee ? cloneEmployee(employee) : null;
}

/**
 * Persists a new employee record.
 * @param {{ name: string, email: string, department: string, role: string, hireDate: string, salary: number }} payload The employee payload.
 * @returns {Promise<object>} The created employee.
 */
async function createEmployeeRecord(payload) {
  if (isDatabaseEnabled()) {
    const result = await query(
      'INSERT INTO employees (id, name, email, department, role, hire_date, salary) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, email, department, role, hire_date AS "hireDate", salary',
      [randomUUID(), payload.name, payload.email, payload.department, payload.role, payload.hireDate, payload.salary]
    );

    return mapEmployeeRow(result.rows[0]);
  }

  const employee = {
    id: randomUUID(),
    name: payload.name,
    email: payload.email,
    department: payload.department,
    role: payload.role,
    hireDate: payload.hireDate,
    salary: Number(payload.salary),
  };

  getMemoryState().employees.unshift(employee);
  return cloneEmployee(employee);
}

/**
 * Updates an existing employee record.
 * @param {string} id The employee identifier.
 * @param {{ name: string, email: string, department: string, role: string, hireDate: string, salary: number }} payload The replacement employee payload.
 * @returns {Promise<object | null>} The updated employee or null.
 */
async function updateEmployeeRecord(id, payload) {
  if (isDatabaseEnabled()) {
    const result = await query(
      'UPDATE employees SET name = $2, email = $3, department = $4, role = $5, hire_date = $6, salary = $7 WHERE id = $1 RETURNING id, name, email, department, role, hire_date AS "hireDate", salary',
      [id, payload.name, payload.email, payload.department, payload.role, payload.hireDate, payload.salary]
    );

    return result.rows[0] ? mapEmployeeRow(result.rows[0]) : null;
  }

  const state = getMemoryState();
  const employeeIndex = state.employees.findIndex((entry) => entry.id === id);

  if (employeeIndex === -1) {
    return null;
  }

  state.employees[employeeIndex] = {
    ...state.employees[employeeIndex],
    ...payload,
    salary: Number(payload.salary),
  };

  return cloneEmployee(state.employees[employeeIndex]);
}

/**
 * Removes an employee record.
 * @param {string} id The employee identifier.
 * @returns {Promise<boolean>} True when the employee was deleted.
 */
async function deleteEmployeeRecord(id) {
  if (isDatabaseEnabled()) {
    const result = await query("DELETE FROM employees WHERE id = $1", [id]);
    return result.rowCount > 0;
  }

  const state = getMemoryState();
  const originalLength = state.employees.length;
  state.employees = state.employees.filter((entry) => entry.id !== id);
  return state.employees.length !== originalLength;
}

/**
 * Computes the dashboard statistics.
 * @returns {Promise<object>} The employee statistics.
 */
async function getEmployeeStatistics() {
  const employees = await listEmployees();
  return calculateStatistics(employees);
}

module.exports = {
  createEmployeeRecord,
  deleteEmployeeRecord,
  getEmployeeById,
  getEmployeeStatistics,
  listEmployees,
  updateEmployeeRecord,
};
