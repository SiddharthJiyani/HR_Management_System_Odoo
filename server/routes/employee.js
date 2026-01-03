const express = require("express");
const router = express.Router();
const { auth, isHR, isAdmin, isHRorAdmin } = require("../middleware/auth");
const employeeController = require("../controllers/Employee");

// Public routes (none for employees)

// Protected routes - Employee
router.get("/me", auth, employeeController.getMyProfile);
router.put("/me", auth, employeeController.updateMyProfile);
router.get("/me/salary", auth, employeeController.getMySalary);

// Protected routes - HR/Admin only
router.get("/", auth, isHRorAdmin, employeeController.getAllEmployees);
router.get("/stats", auth, isHRorAdmin, employeeController.getEmployeeStats);

// Protected routes - All authenticated users can view employee by ID (with role-based filtering)
router.get("/:id", auth, employeeController.getEmployeeById);

// Protected routes - Admin only for salary management
router.get("/:id/salary", auth, employeeController.getEmployeeSalary);
router.put("/:id/salary", auth, isAdmin, employeeController.updateEmployeeSalary);

// Protected routes - Admin can edit, HR can only view (handled in controller)
router.post("/", auth, isHRorAdmin, employeeController.createEmployee);
router.put("/:id", auth, employeeController.updateEmployee);
router.delete("/:id", auth, isHRorAdmin, employeeController.deleteEmployee);

module.exports = router;
