const express = require("express");
require("dotenv").config();
const app = express();
const argon2 = require('argon2');
const Admin = require("../../models/AdminModel");
const bcrypt = require("bcryptjs");
let jwt = require("jsonwebtoken");

const Doctor = require("../../models/DoctorModel");
const DoctorSchedule = require("../../models/DoctorSchedule");
const Patient = require("../../models/PatientModel");
const Complaint = require("../../models/Complaints");

const adminController = require("../../controller/adminController");
const { body, validationResult } = require("express-validator");
const router = express.Router();

app.use(express.json());

const doctorController = require("../../controller/doctorController");




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
        const doctor = await Doctor.findOne({email});
        console.log(doctor);
        const token = jwt.sign({ doctor }, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "300s",
        });
  
        if (!doctor) {
          const error = new Error("Invalid Email!::");
          error.statuscode = 401;
          throw error;
        } else {
        const passwordMatches = await argon2.verify(doctor.password, password);


          if (!passwordMatches) {
            const error = new Error("Invalid Password!");
            error.statuscode = 401;
            throw error;
          }
          res.status(200).json({
            email,
            message: "Doctor Login sucessfull ",
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


router.post("/schedule", async (req,res,next)=>{
  try{
    const { email,slots } = req.body;
    
    const schedule = new DoctorSchedule({
      email,
      slots,
    })

    await schedule.save();

    res.json(schedule);

  }catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
})

router.get("/getAllPatients/:doctorId",doctorController.getAllPatients);


module.exports = router;
