import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AnalyticsPanel from "../components/AnalyticsPanel";
import EmployeeFilters from "../components/EmployeeFilters";
import EmployeeForm from "../components/EmployeeForm";
import EmployeeList from "../components/EmployeeList";
import FocusTimer from "../components/FocusTimer";
import ProgressionPanel from "../components/ProgressionPanel";
import StatsGrid from "../components/StatsGrid";
import { useAuth } from "../hooks/useAuth";
import { useEmployees } from "../hooks/useEmployees";
import {
  fetchFocusProgression,
  fetchFocusStats,
  getApiErrorMessage,
  recordFocusSession,
} from "../services/api";

/**
 * Renders the employee dashboard.
 * @returns {JSX.Element} The dashboard page.
 */
function DashboardPage() {
  const navigate = useNavigate();
  const { logout, token, user } = useAuth();
  const { employees, stats, filters, setFilters, isLoading, error, reload, createEmployee, updateEmployee, removeEmployee } =
    useEmployees(token);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [banner, setBanner] = useState({ type: "", message: "" });
  const [progression, setProgression] = useState(null);
  const [focusStats, setFocusStats] = useState(null);

  const loadFocusData = useCallback(async () => {
    if (!token) return;
    try {
      const [prog, stats] = await Promise.all([
        fetchFocusProgression(token),
        fetchFocusStats(token),
      ]);
      setProgression(prog);
      setFocusStats(stats);
    } catch {
      // Non-critical: focus data failing should not break the dashboard
    }
  }, [token]);

  useEffect(() => {
    loadFocusData();
  }, [loadFocusData]);

  const departmentOptions = stats?.departments?.map((entry) => entry.name) || [];
  const roleOptions = stats?.roles?.map((entry) => entry.name) || [];

  /**
   * Updates one or more employee filters.
   * @param {{ search?: string, department?: string, role?: string }} nextFilters The partial filter update.
   * @returns {void}
   */
  function handleFilterChange(nextFilters) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      ...nextFilters,
    }));
  }

  /**
   * Clears all active employee filters.
   * @returns {void}
   */
  function handleFilterReset() {
    setFilters({
      search: "",
      department: "",
      role: "",
    });
  }

  /**
   * Prepares the form for a new employee.
   * @returns {void}
   */
  function handleStartCreate() {
    setSelectedEmployee(null);
    setBanner({ type: "", message: "" });
  }

  /**
   * Loads an employee into the edit form.
   * @param {object} employee The employee to edit.
   * @returns {void}
   */
  function handleEdit(employee) {
    setSelectedEmployee(employee);
    setBanner({ type: "", message: "" });
  }

  /**
   * Deletes an employee after confirmation.
   * @param {{ id: string, name: string }} employee The employee to delete.
   * @returns {Promise<void>} A resolved promise when deletion completes.
   */
  async function handleDelete(employee) {
    const confirmed = window.confirm(`Delete ${employee.name}?`);

    if (!confirmed) {
      return;
    }

    try {
      await removeEmployee(employee.id);
      setBanner({ type: "success", message: `${employee.name} was removed.` });

      if (selectedEmployee?.id === employee.id) {
        setSelectedEmployee(null);
      }
    } catch (requestError) {
      setBanner({ type: "error", message: getApiErrorMessage(requestError) });
    }
  }

  /**
   * Creates or updates an employee.
   * @param {{ name: string, email: string, department: string, role: string, hireDate: string, salary: number }} payload The employee payload.
   * @returns {Promise<void>} A resolved promise when saving completes.
   */
  async function handleSubmit(payload) {
    setIsSubmitting(true);
    setBanner({ type: "", message: "" });

    try {
      if (selectedEmployee) {
        await updateEmployee(selectedEmployee.id, payload);
        setBanner({ type: "success", message: `${payload.name} was updated.` });
      } else {
        await createEmployee(payload);
        setBanner({ type: "success", message: `${payload.name} was added.` });
      }

      setSelectedEmployee(null);
    } catch (requestError) {
      setBanner({ type: "error", message: getApiErrorMessage(requestError) });
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Logs the user out and returns to the login page.
   * @returns {Promise<void>} A resolved promise when logout completes.
   */
  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  /**
   * Refreshes the dashboard data.
   * @returns {Promise<void>} A resolved promise when refresh completes.
   */
  async function handleRefresh() {
    await reload();
    await loadFocusData();
    setBanner({ type: "success", message: "Dashboard refreshed." });
  }

  /**
   * Records a completed focus session and refreshes progression data.
   * @param {number} durationMinutes The session duration in minutes.
   * @returns {Promise<void>}
   */
  async function handleSessionComplete(durationMinutes) {
    try {
      await recordFocusSession(token, durationMinutes);
      await loadFocusData();
    } catch (requestError) {
      setBanner({ type: "error", message: getApiErrorMessage(requestError) });
    }
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <div className="eyebrow">Team operations</div>
          <h1 className="page-title">Welcome back, {user?.name || "team lead"}</h1>
          <p className="page-subtitle">
            Track employee records, segment the workforce, and keep compensation data up to date.
          </p>
        </div>

        <div className="header-actions">
          <button className="secondary-button" type="button" onClick={handleRefresh}>
            Refresh
          </button>
          <button className="primary-button" type="button" onClick={handleStartCreate}>
            New employee
          </button>
          <button className="danger-button" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {banner.message ? <div className={`status-banner ${banner.type}`}>{banner.message}</div> : null}
      {error ? <div className="status-banner error">{error}</div> : null}

      <StatsGrid stats={stats} />

      <div className="focus-section">
        <FocusTimer token={token} onSessionComplete={handleSessionComplete} />
        <ProgressionPanel progression={progression} />
      </div>

      <AnalyticsPanel focusStats={focusStats} />

      <section className="dashboard-layout">
        <div className="dashboard-main">
          <EmployeeFilters
            filters={filters}
            departments={departmentOptions}
            roles={roleOptions}
            onChange={handleFilterChange}
            onReset={handleFilterReset}
          />
          <EmployeeList employees={employees} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />
        </div>

        <aside className="dashboard-sidebar">
          <EmployeeForm
            employee={selectedEmployee}
            onSubmit={handleSubmit}
            onCancel={handleStartCreate}
            isSubmitting={isSubmitting}
          />
        </aside>
      </section>
    </main>
  );
}

export default DashboardPage;
