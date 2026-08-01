import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [employeeData, setEmployeeData] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  function getEmptyForm() {
    return {
      email: "",
      password: "",
      role: "",
      fullName: "",
      phone: "",
      department: "",
      designation: "",
      salary: "",
      joiningDate: "",
      status: "Active",
    };
  }

  const [form, setForm] = useState(getEmptyForm());

  async function fetchEmployees() {
    try {
      const res = await axios.get("http://localhost:8080/");
      setEmployeeData(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setForm(getEmptyForm());
    setIsEditMode(false);
    setEditingEmployee(null);
  }

  function openCreateForm() {
    resetForm();
    setIsFormOpen(true);
  }

  function openEditForm(emp) {
    setIsEditMode(true);
    setEditingEmployee(emp);
    setForm({
      email: emp.email || "",
      password: emp.password || "",
      role: emp.role || "",
      fullName: emp.fullName || "",
      phone: emp.phone || "",
      department: emp.department || "",
      designation: emp.designation || "",
      salary: emp.salary || "",
      joiningDate: emp.joiningDate ? emp.joiningDate.split("T")[0] : "",
      status: emp.status?.toLowerCase() === "inactive" ? "Inactive" : "Active",
    });
    setIsFormOpen(true);
  }

  async function handleDelete(emp) {
    if (!window.confirm(`Delete ${emp.fullName || emp.email}?`)) return;

    try {
      await axios.delete(`http://localhost:8080/employee/delete/${emp._id}`);
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (isEditMode && editingEmployee?._id) {
        await axios.put(
          `http://localhost:8080/employee/update/${editingEmployee._id}`,
          form,
        );
      } else {
        await axios.post("http://localhost:8080/employee/create", form);
      }

      setIsFormOpen(false);
      resetForm();
      fetchEmployees();
    } catch (err) {
      console.error(err);
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

  return (
    <div className={`app-container ${isFormOpen ? "blurred" : ""}`}>
      <button
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

      <section className="employee-list">
        <div className="section-header">
          <h3>Employees</h3>
          <span>
            {Array.isArray(employeeData) && employeeData.length
              ? `${employeeData.length} records`
              : "0 records"}
          </span>
        </div>

        {Array.isArray(employeeData) && employeeData.length ? (
          <div className="table-wrapper">
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Salary</th>
                  <th>Joining Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employeeData.map((emp) => (
                  <tr key={emp._id || emp.email}>
                    <td>{emp.fullName || "—"}</td>
                    <td>{emp.email || "—"}</td>
                    <td>{emp.role || "—"}</td>
                    <td>{emp.department || "—"}</td>
                    <td>{emp.designation || "—"}</td>
                    <td>
                      {emp.salary
                        ? `$${Number(emp.salary).toLocaleString()}`
                        : "—"}
                    </td>
                    <td>{formatDate(emp.joiningDate)}</td>
                    <td>
                      <span
                        className={`status-badge ${getStatusClass(emp.status)}`}
                      >
                        {emp.status || "Active"}
                      </span>
                    </td>
                    <td>
                      <div className="action-cell">
                        <button
                          type="button"
                          className="action-btn edit-btn"
                          onClick={() => openEditForm(emp)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(emp)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-state">No employees found.</p>
        )}
      </section>

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

            <form onSubmit={handleSubmit} className="employee-form">
              <div>
                <label>Full Name</label>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  placeholder="eg., John doe"
                />
              </div>
              <div>
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="eg., myemail@gmail.com"
                />
              </div>
              <div>
                <label>Password</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="***********"
                />
              </div>
              <div>
                <label>Role</label>
                <input
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  placeholder="eg., HR"
                />
              </div>
              <div>
                <label>Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="eg., 9999888877"
                />
              </div>
              <div>
                <label>Department</label>
                <input
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="eg., IT"
                />
              </div>
              <div>
                <label>Designation</label>
                <input
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  placeholder="eg., Developer"
                />
              </div>
              <div>
                <label>Salary</label>
                <input
                  name="salary"
                  type="number"
                  value={form.salary}
                  onChange={handleChange}
                  placeholder="eg., 29000"
                />
              </div>
              <div>
                <label>Joining Date</label>
                <input
                  name="joiningDate"
                  type="date"
                  value={form.joiningDate}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option selected disabled>
                    --Select a status--
                  </option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <button type="submit" className="submit-btn">
                {isEditMode ? "Update Employee" : "Create Employee"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
