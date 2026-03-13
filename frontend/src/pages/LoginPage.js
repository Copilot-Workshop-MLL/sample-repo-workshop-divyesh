import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../hooks/useAuth";
import { getApiErrorMessage } from "../services/api";

/**
 * Renders the login page.
 * @returns {JSX.Element} The login screen.
 */
function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isAuthenticating, login } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  /**
   * Handles login form submission.
   * @param {{ email: string, password: string }} credentials The login payload.
   * @returns {Promise<void>} A resolved promise when login completes.
   */
  async function handleLogin(credentials) {
    setErrorMessage("");

    try {
      await login(credentials);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <div className="hero-copy">
          <div className="eyebrow">Employee management</div>
          <h2>Coordinate hiring, compensation, and team structure from one place.</h2>
          <p>
            This starter app includes authentication, employee CRUD workflows, dashboard statistics, and filterable search.
          </p>
        </div>
        <div className="hero-card panel">
          <div className="hero-card-title">Included in this scaffold</div>
          <ul className="hero-list">
            <li>JWT-based authentication</li>
            <li>RESTful employee CRUD API</li>
            <li>Department and role filters</li>
            <li>Responsive React dashboard</li>
          </ul>
        </div>
      </section>

      <LoginForm onSubmit={handleLogin} isSubmitting={isAuthenticating} errorMessage={errorMessage} />
    </main>
  );
}

export default LoginPage;
