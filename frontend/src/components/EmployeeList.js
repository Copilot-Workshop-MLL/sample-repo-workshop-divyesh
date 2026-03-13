import React from "react";

/**
 * Formats a salary value for display.
 * @param {number} value The salary value.
 * @returns {string} The formatted salary.
 */
function formatSalary(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formats a date for display.
 * @param {string} value The ISO date string.
 * @returns {string} The formatted date.
 */
function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

/**
 * Renders the employee list.
 * @param {{ employees: Array<object>, isLoading: boolean, onEdit: Function, onDelete: Function }} props The component props.
 * @returns {JSX.Element} The employee list component.
 */
function EmployeeList({ employees, isLoading, onEdit, onDelete }) {
  if (isLoading) {
    return <section className="panel employee-list empty-state">Loading employees...</section>;
  }

  if (!employees.length) {
    return (
      <section className="panel employee-list empty-state">
        No employees match the current filters.
      </section>
    );
  }

  return (
    <section className="panel employee-list" aria-label="Employee list">
      <div className="section-title">Employees</div>
      <div className="employee-table">
        {employees.map((employee) => (
          <article className="employee-row" key={employee.id}>
            <div>
              <h3>{employee.name}</h3>
              <p>{employee.email}</p>
            </div>
            <div>
              <strong>{employee.department}</strong>
              <p>{employee.role}</p>
            </div>
            <div>
              <strong>{formatSalary(employee.salary)}</strong>
              <p>Hired {formatDate(employee.hireDate)}</p>
            </div>
            <div className="employee-actions">
              <button className="secondary-button" type="button" onClick={() => onEdit(employee)}>
                Edit
              </button>
              <button className="danger-button" type="button" onClick={() => onDelete(employee)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default EmployeeList;
