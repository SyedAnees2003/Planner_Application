const express = require("express");
const { register, login } = require("../controllers/authController");
const handleValidation = require("../validators/handleValidation");
const {registerValidator, loginValidator} = require("../validators/authValidator");

const router = express.Router();

router.post(
    "/register",
    registerValidator,
    handleValidation,
    register
  );
  
router.post("/login", loginValidator, handleValidation, login);

module.exports = router;
