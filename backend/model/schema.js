let mongoose = require("mongoose");

let emp_Schema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  role: { type: String, default: "Employee" }, // Admin, HR, or Employee

  // Personal Info
  fullName: { type: String, required: true },
  phone: { type: String, required: true },

  // Work Info
  department: { type: String, required: true }, // e.g., "IT", "HR", "Sales"
  salary: { type: Number, required: true },
  joiningDate: { type: Date, default: Date.now },
  status: { type: String, default: "Active" }, // Active or Inactive
});

let Employee = mongoose.model("Employee", emp_Schema);

module.exports = Employee;
