const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getUsers,
  resetPassword,
  forgotPassword,
} = require("../controllers/user");
const { body } = require("express-validator");
const { auth } = require("../util/middleware");

// Validation rules
const validationRules = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

router.post("/register", validationRules, register);

router.post("/login", validationRules, login);

router.get("/users", auth, getUsers);

router.post("/forgot-password", validationRules, forgotPassword);

router.post("/reset-password/:token", resetPassword);

module.exports = router;
