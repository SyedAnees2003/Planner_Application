const express = require("express");
const { register, login, forgotPassword } = require("../controllers/authController");
const handleValidation = require("../validators/handleValidation");
const {registerValidator, loginValidator, forgotPasswordValidator} = require("../validators/authValidator");

const router = express.Router();

router.post(
    "/register",
    registerValidator,
    handleValidation,
    register
  );
  
router.post("/login", 
  loginValidator, 
  handleValidation, 
  login
);

router.post(
  "/forgot-password",
  forgotPasswordValidator,
  handleValidation,
  forgotPassword
);

module.exports = router;
