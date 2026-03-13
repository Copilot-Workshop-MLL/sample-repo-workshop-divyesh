import React from "react";
import { useForm } from "react-hook-form";

/**
 * Renders the login form.
 * @param {{ onSubmit: Function, isSubmitting: boolean, errorMessage: string }} props The component props.
 * @returns {JSX.Element} The login form.
 */
function LoginForm({ onSubmit, isSubmitting, errorMessage }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "admin@example.com",
      password: "admin123",
    },
  });

  return (
    <form className="panel login-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="eyebrow">Secure access</div>
      <h1 className="page-title">Employee command center</h1>
      <p className="page-subtitle">
        Sign in to manage employees, review statistics, and keep hiring records current.
      </p>

      <label className="field-group" htmlFor="email">
        <span>Email</span>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="admin@example.com"
          {...register("email", {
            required: "Email is required.",
          })}
        />
        {errors.email ? <small className="field-error">{errors.email.message}</small> : null}
      </label>

      <label className="field-group" htmlFor="password">
        <span>Password</span>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          {...register("password", {
            required: "Password is required.",
          })}
        />
        {errors.password ? <small className="field-error">{errors.password.message}</small> : null}
      </label>

      {errorMessage ? <div className="status-banner error">{errorMessage}</div> : null}

      <button className="primary-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Login"}
      </button>

      <div className="login-hint">
        Demo credentials: <strong>admin@example.com</strong> / <strong>admin123</strong>
      </div>
    </form>
  );
}

export default LoginForm;
