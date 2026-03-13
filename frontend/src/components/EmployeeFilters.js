import React from "react";

/**
 * Renders the employee filter controls.
 * @param {{ filters: { search: string, department: string, role: string }, departments: Array<string>, roles: Array<string>, onChange: Function, onReset: Function }} props The component props.
 * @returns {JSX.Element} The filter toolbar.
 */
function EmployeeFilters({ filters, departments, roles, onChange, onReset }) {
  return (
    <section className="panel filters-panel" aria-label="Employee filters">
      <div>
        <div className="section-title">Find employees</div>
        <p className="section-subtitle">Search by name or email, then narrow by department or role.</p>
      </div>

      <div className="filter-grid">
        <label className="field-group" htmlFor="employee-search">
          <span>Search</span>
          <input
            id="employee-search"
            type="search"
            placeholder="Search employees"
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
          />
        </label>

        <label className="field-group" htmlFor="department-filter">
          <span>Department</span>
          <select
            id="department-filter"
            value={filters.department}
            onChange={(event) => onChange({ department: event.target.value })}
          >
            <option value="">All departments</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </label>

        <label className="field-group" htmlFor="role-filter">
          <span>Role</span>
          <select id="role-filter" value={filters.role} onChange={(event) => onChange({ role: event.target.value })}>
            <option value="">All roles</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button className="secondary-button" type="button" onClick={onReset}>
        Reset filters
      </button>
    </section>
  );
}

export default EmployeeFilters;
