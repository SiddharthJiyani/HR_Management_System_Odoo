const express = require("express");
const router = express.Router();
const { auth, isHRorAdmin } = require("../middleware/auth");
const attendanceController = require("../controllers/Attendance");

// Employee routes
router.post("/check-in", auth, attendanceController.checkIn);
router.post("/check-out", auth, attendanceController.checkOut);
router.get("/my", auth, attendanceController.getMyAttendance);
router.get("/today", auth, attendanceController.getTodayStatus);

// HR/Admin routes
router.get("/all", auth, isHRorAdmin, attendanceController.getAllAttendance);
router.get("/employee/:employeeId", auth, attendanceController.getEmployeeAttendance);
router.post("/mark", auth, isHRorAdmin, attendanceController.markAttendance);

module.exports = router;
