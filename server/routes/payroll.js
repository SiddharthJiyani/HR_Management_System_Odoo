const express = require("express");
const router = express.Router();
const { auth, isHRorAdmin } = require("../middleware/auth");
const payrollController = require("../controllers/Payroll");

// Employee routes (read-only)
router.get("/my", auth, payrollController.getMyPayroll);
router.get("/payslip/:id", auth, payrollController.getPayslip);

// HR/Admin routes
router.get("/all", auth, isHRorAdmin, payrollController.getAllPayrolls);
router.get("/stats", auth, isHRorAdmin, payrollController.getPayrollStats);
router.get("/employee/:employeeId", auth, isHRorAdmin, payrollController.getEmployeePayroll);
router.post("/generate", auth, isHRorAdmin, payrollController.generatePayroll);
router.put("/:id", auth, isHRorAdmin, payrollController.updatePayroll);
router.post("/process/:id", auth, isHRorAdmin, payrollController.processPayment);
router.put("/salary/:employeeId", auth, isHRorAdmin, payrollController.updateSalaryStructure);

module.exports = router;
