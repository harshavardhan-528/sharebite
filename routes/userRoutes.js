const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

/* Register */
router.post("/register", userController.registerUser);

/* Login */
router.post("/login", userController.loginUser);

/* Forgot Password */
router.post("/forgot-password", userController.forgotPassword);

/* Reset Password */
router.post("/reset-password", userController.resetPassword);

/* Update Location */
router.post("/update-location", userController.updateLocation);

module.exports = router;