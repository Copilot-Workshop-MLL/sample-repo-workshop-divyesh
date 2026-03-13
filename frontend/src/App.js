import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthGuard from "./components/AuthGuard";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { SettingsProvider } from "./hooks/useSettings";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";

/**
 * Redirects unknown routes based on authentication state.
 * @returns {JSX.Element} The redirect target.
 */
function DefaultRoute() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

/**
 * Renders the top-level application routes.
 * @returns {JSX.Element} The application router.
 */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <AuthGuard>
            <DashboardPage />
          </AuthGuard>
        }
      />
      <Route path="*" element={<DefaultRoute />} />
    </Routes>
  );
}

/**
 * Renders the Employee Management frontend.
 * @returns {JSX.Element} The complete app.
 */
function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
