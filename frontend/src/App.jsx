import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [employeeData, setEmployeeData] = useState([]);
  const [isForm, setIsForm] = useState(true);

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "",
    fullName: "",
    phone: "",
    department: "",
    designation: "",
    salary: "",
    joiningDate: "",
    status: "",
  });

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

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/employee/create", form);
      setForm({
        email: "",
        password: "",
        role: "",
        fullName: "",
        phone: "",
        department: "",
        designation: "",
        salary: "",
        joiningDate: "",
        status: "",
      });
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
    <>
      <div className="app-container">
        <button className="toggle-btn" onClick={() => setIsForm((v) => !v)}>
          {isForm ? "Hide Form" : "Show Form"}
        </button>

        {isForm && (
          <form onSubmit={handleSubmit} className="employee-form">
            <div>
              <label>Full Name</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
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
              />
            </div>
            <div>
              <label>Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Role</label>
              <input name="role" value={form.role} onChange={handleChange} />
            </div>
            <div>
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div>
              <label>Department</label>
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Designation</label>
              <input
                name="designation"
                value={form.designation}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Salary</label>
              <input
                name="salary"
                type="number"
                value={form.salary}
                onChange={handleChange}
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
              <input
                name="status"
                value={form.status}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="submit-btn">
              Create Employee
            </button>
          </form>
        )}

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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-state">No employees found.</p>
          )}
        </section>
      </div>
    </>
  );
}

export default App;
