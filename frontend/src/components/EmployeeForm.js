import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

const emptyEmployee = {
  name: "",
  email: "",
  department: "",
  role: "",
  hireDate: "",
  salary: 0,
};

/**
 * Renders the employee create and update form.
 * @param {{ employee: object | null, onSubmit: Function, onCancel: Function, isSubmitting: boolean }} props The component props.
 * @returns {JSX.Element} The employee form.
 */
function EmployeeForm({ employee, onSubmit, onCancel, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: employee || emptyEmployee,
  });

  useEffect(() => {
    reset(employee || emptyEmployee);
  }, [employee, reset]);

  return (
    <form className="panel employee-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="section-title">{employee ? "Update employee" : "Add employee"}</div>
      <p className="section-subtitle">Capture the essential details used across reporting, search, and staffing views.</p>

      <label className="field-group" htmlFor="employee-name">
        <span>Name</span>
        <input
          id="employee-name"
          type="text"
          placeholder="Full name"
          {...register("name", { required: "Name is required." })}
        />
        {errors.name ? <small className="field-error">{errors.name.message}</small> : null}
      </label>

      <label className="field-group" htmlFor="employee-email">
        <span>Email</span>
        <input
          id="employee-email"
          type="email"
          placeholder="name@example.com"
          {...register("email", { required: "Email is required." })}
        />
        {errors.email ? <small className="field-error">{errors.email.message}</small> : null}
      </label>

      <div className="form-split">
        <label className="field-group" htmlFor="employee-department">
          <span>Department</span>
          <input
            id="employee-department"
            type="text"
            placeholder="Engineering"
            {...register("department", { required: "Department is required." })}
          />
          {errors.department ? <small className="field-error">{errors.department.message}</small> : null}
        </label>

        <label className="field-group" htmlFor="employee-role">
          <span>Role</span>
          <input
            id="employee-role"
            type="text"
            placeholder="Product Designer"
            {...register("role", { required: "Role is required." })}
          />
          {errors.role ? <small className="field-error">{errors.role.message}</small> : null}
        </label>
      </div>

      <div className="form-split">
        <label className="field-group" htmlFor="employee-hire-date">
          <span>Hire date</span>
          <input
            id="employee-hire-date"
            type="date"
            {...register("hireDate", { required: "Hire date is required." })}
          />
          {errors.hireDate ? <small className="field-error">{errors.hireDate.message}</small> : null}
        </label>

        <label className="field-group" htmlFor="employee-salary">
          <span>Salary</span>
          <input
            id="employee-salary"
            type="number"
            min="0"
            step="1000"
            {...register("salary", {
              required: "Salary is required.",
              valueAsNumber: true,
            })}
          />
          {errors.salary ? <small className="field-error">{errors.salary.message}</small> : null}
        </label>
      </div>

      <div className="button-row">
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : employee ? "Save changes" : "Create employee"}
        </button>
        {employee ? (
          <button className="secondary-button" type="button" onClick={onCancel}>
            Cancel editing
          </button>
        ) : null}
      </div>
    </form>
  );
}

export default EmployeeForm;
