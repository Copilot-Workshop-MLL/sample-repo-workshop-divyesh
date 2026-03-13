import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Blocks access to protected routes when the user is unauthenticated.
 * @param {{ children: React.ReactNode }} props The component props.
 * @returns {JSX.Element} The protected content or a redirect.
 */
function AuthGuard({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default AuthGuard;
