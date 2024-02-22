const express = require("express");
require("dotenv").config();
const app = express();
const argon2 = require("argon2");

let jwt = require("jsonwebtoken");

const Patient = require("../models/userModel");

const { body, validationResult } = require("express-validator");

const router = express.Router();

app.use(express.json());

router.post("/signup", async (req, res, next) => {
  try {
    console.log("I am here");
    res.status(200).json({
      message: "inside this API",
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
});

router.post(
  "/login",
  [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Enter a valid email"),
    body("password").trim().notEmpty().withMessage("Password is required"),
  ],
  async (req, res, next) => {
    try {
      console.log(req.body);
      const err = validationResult(req);
      if (!err.isEmpty()) {
        const error = new Error("Validation Failed");
        error.statusCode = 422;
        error.data = err.array();
        throw error;
      }

      const { email, password } = req.body;
      const patient = await Patient.findOne({ email });
      console.log(patient);
      const token = jwt.sign({ patient }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "300s",
      });

      if (!patient) {
        const error = new Error("Invalid Email!");
        error.statuscode = 401;
        throw error;
      } else {
        const passwordMatches = await argon2.verify(patient.password, password);

        if (!passwordMatches) {
          const error = new Error("Invalid Password!");
          error.statuscode = 401;
          throw error;
        }
        const name = patient.name;
        res.status(200).json({
          email,
          name,
          message: "Patient Login sucessfull ",
          token,
        });
      }
    } catch (error) {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    }
  }
);

module.exports = router;
