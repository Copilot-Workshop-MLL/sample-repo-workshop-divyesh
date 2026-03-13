import { useDeferredValue, useEffect, useState } from "react";
import {
  createEmployee as createEmployeeRequest,
  deleteEmployee as deleteEmployeeRequest,
  fetchDashboardStats,
  fetchEmployees,
  getApiErrorMessage,
  updateEmployee as updateEmployeeRequest,
} from "../services/api";

/**
 * Manages employee list, filters, and dashboard statistics.
 * @param {string} token The active bearer token.
 * @returns {{ employees: Array<object>, stats: object | null, filters: { search: string, department: string, role: string }, setFilters: Function, isLoading: boolean, error: string, reload: Function, createEmployee: Function, updateEmployee: Function, removeEmployee: Function }} The employee state helpers.
 */
export function useEmployees(token) {
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    role: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const deferredSearch = useDeferredValue(filters.search);

  /**
   * Fetches employees and statistics using the provided filters.
   * @param {{ search?: string, department?: string, role?: string }} nextFilters The filters to fetch.
   * @returns {Promise<void>} A resolved promise when loading completes.
   */
  async function reload(nextFilters) {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const filtersToUse = nextFilters || {
        search: deferredSearch,
        department: filters.department,
        role: filters.role,
      };

      const [employeeResponse, statsResponse] = await Promise.all([
        fetchEmployees(token, filtersToUse),
        fetchDashboardStats(token),
      ]);

      setEmployees(employeeResponse.data);
      setStats(statsResponse);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!token) {
      return;
    }

    let isCurrent = true;

    async function loadInitialData() {
      setIsLoading(true);
      setError("");

      try {
        const [employeeResponse, statsResponse] = await Promise.all([
          fetchEmployees(token, {
            search: deferredSearch,
            department: filters.department,
            role: filters.role,
          }),
          fetchDashboardStats(token),
        ]);

        if (!isCurrent) {
          return;
        }

        setEmployees(employeeResponse.data);
        setStats(statsResponse);
      } catch (requestError) {
        if (isCurrent) {
          setError(getApiErrorMessage(requestError));
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      isCurrent = false;
    };
  }, [token, filters.department, filters.role, deferredSearch]);

  /**
   * Creates a new employee and refreshes the dashboard data.
   * @param {{ name: string, email: string, department: string, role: string, hireDate: string, salary: number }} payload The employee payload.
   * @returns {Promise<object>} The created employee.
   */
  async function createEmployee(payload) {
    const createdEmployee = await createEmployeeRequest(token, payload);
    await reload();
    return createdEmployee;
  }

  /**
   * Updates an employee and refreshes the dashboard data.
   * @param {string} employeeId The employee identifier.
   * @param {{ name: string, email: string, department: string, role: string, hireDate: string, salary: number }} payload The employee payload.
   * @returns {Promise<object>} The updated employee.
   */
  async function updateEmployee(employeeId, payload) {
    const updatedEmployee = await updateEmployeeRequest(token, employeeId, payload);
    await reload();
    return updatedEmployee;
  }

  /**
   * Deletes an employee and refreshes the dashboard data.
   * @param {string} employeeId The employee identifier.
   * @returns {Promise<void>} A resolved promise when deletion completes.
   */
  async function removeEmployee(employeeId) {
    await deleteEmployeeRequest(token, employeeId);
    await reload();
  }

  return {
    employees,
    stats,
    filters,
    setFilters,
    isLoading,
    error,
    reload,
    createEmployee,
    updateEmployee,
    removeEmployee,
  };
}
