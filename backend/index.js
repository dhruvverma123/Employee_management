require("dotenv").config();
let express = require("express");
let cors = require("cors");
let Employee = require("./model/schema");
let mongoose = require("mongoose");

let app = express();
let PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      "https://employee-management-1-qo93.onrender.com",
      "http://localhost:5173",
    ],
  }),
);

app.get("/", async (req, res, next) => {
  try {
    let allEmployee = await Employee.find({});
    res.json(allEmployee);
  } catch (err) {
    next(err);
  }
});

app.post("/employee/create", (req, res, next) => {
  try {
    let {
      email,
      role,
      fullName,
      phone,
      department,
      salary,
      joiningDate,
      status,
    } = req.body;

    let newEmployee = new Employee({
      email: email,
      role: role,
      fullName: fullName,
      phone: phone,
      department: department,
      salary: salary,
      joiningDate: joiningDate,
      status: status,
    });

    newEmployee.save();
    res.json({ message: "EmployeeData has been created", success: true });
  } catch (err) {
    next(err);
  }
});

app.put("/employee/update/:id", async (req, res, next) => {
  try {
    let { id } = req.params;
    let {
      email,
      role,
      fullName,
      phone,
      department,
      salary,
      joiningDate,
      status,
    } = req.body;

    let newEmployee = await Employee.findByIdAndUpdate(id, {
      email: email,
      role: role,
      fullName: fullName,
      phone: phone,
      department: department,
      salary: salary,
      joiningDate: joiningDate,
      status: status,
    });

    res.json({ message: "EmployeeData has been updated", success: true });
  } catch (err) {
    next(err);
  }
});

app.delete("/employee/delete/:id", async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  const status = Number(err.status) || 500;
  const message = err.message || "An unexpected error occurred";

  res.status(status).json({
    success: false,
    message: message,
  });
});

const MONGO_URI = process.env.MONGODB_KEY;

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`server is running at ${PORT}`));
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}

startServer();
