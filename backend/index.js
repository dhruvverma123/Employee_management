require("dotenv").config();
let express = require("express");
let cors = require("cors");
let Employee = require("./model/schema");
let mongoose = require("mongoose");

let app = express();
let PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({ origin: "http://localhost:5173" }));

app.get("/", async (req, res) => {
  let allEmployee = await Employee.find({});
  res.json(allEmployee);
});

app.post("/employee/create", (req, res) => {
  let {
    email,
    password,
    role,
    fullName,
    phone,
    department,
    designation,
    salary,
    joiningDate,
    status,
  } = req.body;

  let newEmployee = new Employee({
    email: email,
    password: password,
    role: role,
    fullName: fullName,
    phone: phone,
    department: department,
    designation: designation,
    salary: salary,
    joiningDate: joiningDate,
    status: status,
  });

  newEmployee.save();
  res.json({ message: "EmployeeData has been created", success: true });
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
