const express = require("express");
const router = express.Router();
const { auth, isHRorAdmin } = require("../middleware/auth");
const leaveController = require("../controllers/Leave");

// Employee routes
router.post("/apply", auth, leaveController.applyLeave);
router.get("/my", auth, leaveController.getMyLeaves);
router.get("/balance", auth, leaveController.getLeaveBalance);
router.put("/cancel/:id", auth, leaveController.cancelLeave);

// HR/Admin routes
router.get("/all", auth, isHRorAdmin, leaveController.getAllLeaves);
router.get("/stats", auth, isHRorAdmin, leaveController.getLeaveStats);
router.put("/status/:id", auth, isHRorAdmin, leaveController.updateLeaveStatus);

module.exports = router;
