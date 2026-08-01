import { useEffect, useMemo, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function App() {
  const [employeeData, setEmployeeData] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  function getEmptyForm() {
    return {
      email: "",
      role: "",
      fullName: "",
      phone: "",
      department: "",
      salary: "",
      joiningDate: "",
      status: "Active",
    };
  }

  const [formValues, setFormValues] = useState(getEmptyForm());

  async function fetchEmployees() {
    try {
      const res = await axios.get(
        `https://employee-management-j1tk.onrender.com/`,
      );
      setEmployeeData(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load employee data");
    }
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const handleOutsideClick = () => {
      setOpenActionMenuId(null);
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        fullName: Yup.string().required("Full Name is required"),
        email: Yup.string()
          .email("Invalid email")
          .required("Email is required")
          .test("unique-email", "Email already exists", function (value) {
            if (!value) return true;

            const normalized = value.toLowerCase();
            return !employeeData.some(
              (emp) =>
                emp.email?.toLowerCase() === normalized &&
                emp._id !== editingEmployee?._id,
            );
          }),
        role: Yup.string(),
        phone: Yup.string()
          .nullable()
          .transform((value) => (value === "" ? null : value))
          .matches(/^\d{10}$/, "Phone must be 10 digits")
          .notRequired(),
        department: Yup.string(),
        salary: Yup.number()
          .nullable()
          .transform((value, originalValue) =>
            originalValue === "" ? null : value,
          )
          .typeError("Salary must be a number")
          .positive("Salary must be positive")
          .integer("Salary must be an integer")
          .notRequired(),
        joiningDate: Yup.date()
          .nullable()
          .transform((value, originalValue) =>
            originalValue === "" ? null : value,
          )
          .notRequired(),
        status: Yup.string()
          .oneOf(["Active", "Inactive"])
          .required("Status is required"),
      }),
    [employeeData, editingEmployee],
  );

  function toggleActionMenu(id, event) {
    event.stopPropagation();
    setOpenActionMenuId((prev) => (prev === id ? null : id));
  }

  function resetForm() {
    setFormValues(getEmptyForm());
    setIsEditMode(false);
    setEditingEmployee(null);
    setOpenActionMenuId(null);
  }

  function openCreateForm() {
    resetForm();
    setIsFormOpen(true);
  }

  function openEditForm(emp) {
    setIsEditMode(true);
    setEditingEmployee(emp);
    setOpenActionMenuId(null);
    setFormValues({
      email: emp.email || "",
      role: emp.role || "",
      fullName: emp.fullName || "",
      phone: emp.phone || "",
      department: emp.department || "",
      salary: emp.salary || "",
      joiningDate: emp.joiningDate ? emp.joiningDate.split("T")[0] : "",
      status: emp.status?.toLowerCase() === "inactive" ? "Inactive" : "Active",
    });
    setIsFormOpen(true);
  }

  async function handleDelete(emp) {
    if (!window.confirm(`Delete ${emp.fullName || emp.email}?`)) return;

    try {
      await axios.delete(
        `https://employee-management-j1tk.onrender.com/employee/delete/${emp._id}`,
      );
      setOpenActionMenuId(null);
      toast.success("Employee deleted successfully");
      fetchEmployees();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete employee");
    }
  }

  async function handleFormSubmit(values, { setSubmitting }) {
    try {
      if (isEditMode && editingEmployee?._id) {
        await axios.put(
          `https://employee-management-j1tk.onrender.com/employee/update/${editingEmployee._id}`,
          values,
        );
        toast.success("Employee updated successfully");
      } else {
        await axios.post(
          `https://employee-management-j1tk.onrender.com/employee/create`,
          values,
        );
        toast.success("Employee created successfully");
      }

      setIsFormOpen(false);
      resetForm();
      fetchEmployees();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toLocaleDateString();
  }

  function getStatusClass(status) {
    const normalized = (status || "active").toLowerCase();
    switch (normalized) {
      case "inactive":
        return "inactive";
      case "pending":
        return "pending";
      case "terminated":
        return "terminated";
      default:
        return "active";
    }
  }

  const searchFields = [
    "fullName",
    "email",
    "role",
    "phone",
    "department",
    "salary",
    "joiningDate",
    "status",
  ];

  const filteredEmployees = (employeeData || []).filter((emp) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;

    return searchFields.some((key) => {
      const value = emp?.[key];
      if (value === null || value === undefined || value === "") return false;
      return String(value).toLowerCase().includes(q);
    });
  });

  return (
    <div className={`app-container ${isFormOpen ? "blurred" : ""}`}>
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-card">
            <div className="sidebar-brand">
              <div className="sidebar-icon">👔</div>
              <div>
                <h2>Employee Hub</h2>
                <p>Manage employees and keep records updated easily.</p>
              </div>
            </div>

            <button
              type="button"
              className="toggle-btn"
              onClick={() => {
                if (isFormOpen) {
                  setIsFormOpen(false);
                  resetForm();
                } else {
                  openCreateForm();
                }
              }}
            >
              {isFormOpen ? "Close Form" : "Add Employee"}
            </button>
          </div>
        </aside>

        <main className="main-panel">
          <section className="employee-list">
            <div className="section-header">
              <h3>Employees</h3>
              <span>
                {filteredEmployees.length} of {employeeData.length} records
              </span>
            </div>

            <div className="toolbar">
              <div className="search-box">
                <span className="search-icon">🔎</span>
                <input
                  type="text"
                  placeholder="Search by any employee detail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {filteredEmployees.length ? (
              <div className="table-wrapper">
                <table className="employee-table">
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Salary</th>
                      <th>Joining Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((emp) => {
                      const rowId = emp._id || emp.email;

                      return (
                        <tr key={rowId}>
                          <td data-label="Full Name">{emp.fullName || "—"}</td>
                          <td data-label="Email">{emp.email || "—"}</td>
                          <td data-label="Role">{emp.role || "—"}</td>
                          <td data-label="Department">
                            {emp.department || "—"}
                          </td>
                          <td data-label="Salary">
                            {emp.salary
                              ? `$${Number(emp.salary).toLocaleString()}`
                              : "—"}
                          </td>
                          <td data-label="Joining Date">
                            {formatDate(emp.joiningDate)}
                          </td>
                          <td data-label="Status">
                            <span
                              className={`status-badge ${getStatusClass(
                                emp.status,
                              )}`}
                            >
                              {emp.status || "Active"}
                            </span>
                          </td>
                          <td data-label="Actions">
                            <div className="action-cell">
                              <button
                                type="button"
                                className="menu-btn"
                                onClick={(event) =>
                                  toggleActionMenu(rowId, event)
                                }
                                aria-label="Open actions"
                              >
                                ⋮
                              </button>

                              {openActionMenuId === rowId && (
                                <div
                                  className="action-menu"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    className="menu-action-btn edit"
                                    onClick={() => openEditForm(emp)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="menu-action-btn delete"
                                    onClick={() => handleDelete(emp)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty-state">No matching employees found.</p>
            )}
          </section>
        </main>
      </div>

      {isFormOpen && (
        <div
          className="form-overlay"
          onClick={() => {
            setIsFormOpen(false);
            resetForm();
          }}
        >
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
              <h3>{isEditMode ? "Edit Employee" : "Add Employee"}</h3>
              <button
                type="button"
                className="close-form-btn"
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <Formik
              initialValues={formValues}
              enableReinitialize
              validationSchema={validationSchema}
              onSubmit={handleFormSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="employee-form">
                  <div>
                    <label>Full Name</label>
                    <Field name="fullName" placeholder="eg., John Doe" />
                    <ErrorMessage
                      name="fullName"
                      component="div"
                      className="field-error"
                    />
                  </div>

                  <div>
                    <label>Email</label>
                    <Field
                      name="email"
                      type="email"
                      placeholder="eg., myemail@gmail.com"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="field-error"
                    />
                  </div>

                  <div>
                    <label>Role</label>
                    <Field name="role" placeholder="eg., HR" />
                    <ErrorMessage
                      name="role"
                      component="div"
                      className="field-error"
                    />
                  </div>

                  <div>
                    <label>Phone</label>
                    <Field name="phone" placeholder="eg., 9999888877" />
                    <ErrorMessage
                      name="phone"
                      component="div"
                      className="field-error"
                    />
                  </div>

                  <div>
                    <label>Department</label>
                    <Field name="department" placeholder="eg., IT" />
                    <ErrorMessage
                      name="department"
                      component="div"
                      className="field-error"
                    />
                  </div>

                  <div>
                    <label>Salary</label>
                    <Field
                      name="salary"
                      type="number"
                      placeholder="eg., 29000"
                    />
                    <ErrorMessage
                      name="salary"
                      component="div"
                      className="field-error"
                    />
                  </div>

                  <div>
                    <label>Joining Date</label>
                    <Field name="joiningDate" type="date" />
                    <ErrorMessage
                      name="joiningDate"
                      component="div"
                      className="field-error"
                    />
                  </div>

                  <div>
                    <label>Status</label>
                    <Field as="select" name="status">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </Field>
                    <ErrorMessage
                      name="status"
                      component="div"
                      className="field-error"
                    />
                  </div>

                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={isSubmitting}
                  >
                    {isEditMode ? "Update Employee" : "Create Employee"}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
