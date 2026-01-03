const express = require("express");
const router = express.Router();
const { auth, isHR, isAdmin, isHRorAdmin } = require("../middleware/auth");
const employeeController = require("../controllers/Employee");

// Public routes (none for employees)

// Protected routes - Employee
router.get("/me", auth, employeeController.getMyProfile);
router.put("/me", auth, employeeController.updateMyProfile);

// Protected routes - HR/Admin only
router.get("/", auth, isHRorAdmin, employeeController.getAllEmployees);
router.get("/stats", auth, isHRorAdmin, employeeController.getEmployeeStats);
router.get("/:id", auth, employeeController.getEmployeeById);
router.post("/", auth, isHRorAdmin, employeeController.createEmployee);
router.put("/:id", auth, isHRorAdmin, employeeController.updateEmployee);
router.delete("/:id", auth, isHRorAdmin, employeeController.deleteEmployee);

module.exports = router;
