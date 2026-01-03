const express = require("express");
const { signup, login, sendotp, forgotPassword } = require("../controllers/Auth");
const router = express.Router();

router.post("/signup" , signup);
router.post("/login" , login);
router.post("/sendotp",sendotp);
router.post("/forgotpassword",forgotPassword);


module.exports = router;