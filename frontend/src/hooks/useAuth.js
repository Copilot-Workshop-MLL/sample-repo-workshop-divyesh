import React, { createContext, useContext, useState } from "react";
import { loginUser, logoutUser } from "../services/api";

const AUTH_STORAGE_KEY = "employee-management-session";
const AuthContext = createContext(null);

/**
 * Loads the stored session from local storage.
 * @returns {{ token: string, user: object } | null} The stored session or null.
 */
function loadStoredSession() {
  const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch (_error) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

/**
 * Persists the authenticated session to local storage.
 * @param {{ token: string, user: object }} session The authenticated session.
 * @returns {void}
 */
function saveStoredSession(session) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

/**
 * Removes the authenticated session from local storage.
 * @returns {void}
 */
function clearStoredSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * Provides authentication state and actions to the component tree.
 * @param {{ children: React.ReactNode }} props The provider props.
 * @returns {JSX.Element} The auth provider.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadStoredSession);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  /**
   * Authenticates the current user and stores the session.
   * @param {{ email: string, password: string }} credentials The login payload.
   * @returns {Promise<{ token: string, user: object }>} The authenticated session.
   */
  async function login(credentials) {
    setIsAuthenticating(true);

    try {
      const nextSession = await loginUser(credentials);
      setSession(nextSession);
      saveStoredSession(nextSession);
      return nextSession;
    } finally {
      setIsAuthenticating(false);
    }
  }

  /**
   * Clears the current session and notifies the backend.
   * @returns {Promise<void>} A resolved promise when logout completes.
   */
  async function logout() {
    if (session?.token) {
      try {
        await logoutUser(session.token);
      } catch (_error) {
        // Ignore logout API failures because the client can still clear local state.
      }
    }

    setSession(null);
    clearStoredSession();
  }

  const contextValue = {
    session,
    user: session?.user || null,
    token: session?.token || "",
    isAuthenticated: Boolean(session?.token),
    isAuthenticating,
    login,
    logout,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

/**
 * Returns the authentication context.
 * @returns {{ session: object | null, user: object | null, token: string, isAuthenticated: boolean, isAuthenticating: boolean, login: Function, logout: Function }} The auth context.
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }

  return context;
}
