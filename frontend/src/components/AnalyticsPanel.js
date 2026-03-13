import React, { useState } from "react";

/**
 * Renders a simple bar chart using CSS.
 * @param {{ data: Array<{ label: string, count: number }> }} props
 * @returns {JSX.Element}
 */
function BarChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="stat-detail">No data yet. Complete a focus session to see trends.</p>;
  }

  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bar-chart" aria-label="Session frequency chart">
      {data.map((item) => (
        <div key={item.label} className="bar-chart-item">
          <div className="bar-chart-bar-wrap">
            <div
              className="bar-chart-bar"
              style={{ height: `${(item.count / max) * 100}%` }}
              aria-label={`${item.label}: ${item.count} sessions`}
            />
          </div>
          <div className="bar-chart-label">{item.label}</div>
          <div className="bar-chart-count">{item.count}</div>
        </div>
      ))}
    </div>
  );
}

/**
 * Displays weekly and monthly focus session analytics.
 * @param {{ focusStats: { totalSessions: number, weekly: Array<object>, monthly: Array<object> } | null }} props
 * @returns {JSX.Element}
 */
function AnalyticsPanel({ focusStats }) {
  const [view, setView] = useState("weekly");

  const weeklyData = (focusStats?.weekly ?? []).slice(-8).map((item) => ({
    label: item.week,
    count: item.count,
  }));

  const monthlyData = (focusStats?.monthly ?? []).slice(-6).map((item) => ({
    label: item.month,
    count: item.count,
  }));

  const activeData = view === "weekly" ? weeklyData : monthlyData;

  return (
    <section className="panel analytics-panel" aria-label="Focus analytics">
      <div className="analytics-header">
        <h2 className="section-title">
          Analytics
          {focusStats?.totalSessions > 0 && (
            <span className="analytics-total"> · {focusStats.totalSessions} sessions total</span>
          )}
        </h2>
        <div className="analytics-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={view === "weekly"}
            className={`analytics-tab${view === "weekly" ? " active" : ""}`}
            onClick={() => setView("weekly")}
          >
            Weekly
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "monthly"}
            className={`analytics-tab${view === "monthly" ? " active" : ""}`}
            onClick={() => setView("monthly")}
          >
            Monthly
          </button>
        </div>
      </div>

      <BarChart data={activeData} />
    </section>
  );
}

export default AnalyticsPanel;
