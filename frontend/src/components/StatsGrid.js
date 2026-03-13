import React from "react";

/**
 * Formats currency values for display.
 * @param {number} value The salary value.
 * @returns {string} The formatted salary.
 */
function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

/**
 * Renders dashboard statistics.
 * @param {{ stats: { totalEmployees: number, averageSalary: number, departments: Array<object>, roles: Array<object>, newestHire: object | null, highestSalary: object | null } | null }} props The component props.
 * @returns {JSX.Element} The statistics grid.
 */
function StatsGrid({ stats }) {
  const cards = [
    {
      label: "Total employees",
      value: stats?.totalEmployees || 0,
      detail: `${stats?.departments?.length || 0} departments covered`,
    },
    {
      label: "Average salary",
      value: formatCurrency(stats?.averageSalary || 0),
      detail: stats?.highestSalary ? `${stats.highestSalary.name} leads compensation` : "No salary data",
    },
    {
      label: "Most recent hire",
      value: stats?.newestHire?.name || "No recent hires",
      detail: stats?.newestHire ? stats.newestHire.hireDate : "Seed data not loaded",
    },
    {
      label: "Role coverage",
      value: stats?.roles?.length || 0,
      detail: stats?.roles?.length ? `${stats.roles[0].name} is currently represented` : "No roles found",
    },
  ];

  return (
    <section className="stats-grid" aria-label="Employee statistics">
      {cards.map((card) => (
        <article className="stat-card panel" key={card.label}>
          <div className="stat-label">{card.label}</div>
          <div className="stat-value">{card.value}</div>
          <div className="stat-detail">{card.detail}</div>
        </article>
      ))}
    </section>
  );
}

export default StatsGrid;
