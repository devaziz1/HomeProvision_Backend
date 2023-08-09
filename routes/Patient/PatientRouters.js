const express = require("express");
require("dotenv").config();
const app = express();
const argon2 = require('argon2');
const Admin = require("../../models/AdminModel");
const bcrypt = require("bcryptjs");
let jwt = require("jsonwebtoken");

const Doctor = require("../../models/DoctorModel");
const Patient = require("../../models/PatientModel");
const Complaint = require("../../models/Complaints");
const Appointment = require("../../models/AppointmentModel");

const adminController = require("../../controller/adminController");
const { body, validationResult } = require("express-validator");
const router = express.Router();

app.use(express.json());



router.post("/signup", async (req, res, next) => {
    console.log(req.body);
    try {
      const {
        name,
        email,
        password,
        medical_history,
        gender,
        phoneNumber
      } = req.body;
  
      const adminID = "6463e56b2621ab5034d067d8";
  
      const admin = await Admin.findById(adminID);

      const hashedPassword = await argon2.hash(password);
  
      if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
      }
      const existingPatient = await Patient.findOne({ email });
  
      if (existingPatient) {
        const error = new Error("This Email Already Exist...");
        error.statuscode = 401;
        throw error;
      } else {
        const patient = new Patient({
          name,
          password: hashedPassword,
          email,
          medical_history,
          gender,
          phoneNumber,
          adminID: admin._id,
        });
  
        const result = await patient.save();
        admin.patients.push(patient._id);
        await patient.save();
        await admin.save();
  
        const token = jwt.sign(
          {
            userId: result._id,
          },
          "somth",
          {
            expiresIn: "1h",
          }
        );
        res.status(201).json({ mesg: "Patient created sucess", adminId: result._id });
      }
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
        const patient = await Patient.findOne({email});
        const name = patient.name
        console.log(patient);
        const token = jwt.sign({ patient }, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "300s",
        });
  
        if (!patient) {
          const error = new Error("Invalid Email!::");
          error.statuscode = 401;
          throw error;
        } else {
        const passwordMatches = await argon2.verify(patient.password, password);


          if (!passwordMatches) {
            const error = new Error("Invalid Password!");
            error.statuscode = 401;
            throw error;
          }
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

router.post('/createAppointment' , async (req, res, next)  =>{
  try{
    const { email, name, doctorEmail, slot,createdAt } = req.body;
    console.log(doctorEmail); 
        const patient = await Patient.findOne({email});
        
        if (!patient) {
          const error = new Error("Patient Does not exist");
          error.statuscode = 401;
          throw error;
        }
        const doctor = await Doctor.findOne({email:doctorEmail});
        if (!doctor) {
          const error = new Error("Doctor Does not exist");
          error.statuscode = 401;
          throw error;
        }
        
       
          const app = new Appointment({
            email, name, doctorEmail, slot, createdAt
          })

          await app.save();
          console.log("Appiontment Done Sucessfully");

          res.status(200).json({
  
            message: "Appointment created Sucessfully"
           
          });
        


  }catch (error) {
    if (error.code === 11000) {
      // Handle duplicate key error (email already exists)
      res.status(400).json({ error: 'Email already exists in the appointments collection.' });
    }
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
})



router.get("/getAllDoctor/:adminId", async (req, res, next) => {
  try {
    const { adminId } = req.params;

    const admin = await Admin.findById(adminId).populate("doctors");
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const doctors = admin.doctors;

    res.status(200).json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/submitComplaint",async (req, res , next) =>{
  try{
    const {email, description, complainer } = req.body;

    const complaint = new Complaint({
      email,
      complainer,
      description
    })

    await complaint.save();
    res.status(200).json({
  
      message: "Complaint submitted successfully"
     
    });

    
  }catch (error) {
        if (!error.statusCode) {
          error.statusCode = 500;
        }
        next(error);
      }
})

router.post("/submitFeedback",async (req,res, next)=>{
  try{
    const {doctorEmail, rating , feedback} = req.body;
    const doctor = await Doctor.findOne({email : doctorEmail});

    if(!doctor){
      const error = new Error("Please Provide Valid Doctor's Email");
        error.statuscode = 401;
        throw error;
    }
    const currentRating   =   parseFloat(doctor.rating);
    const currentNumOfRating = parseInt(doctor.numberOfRating);

    const newRating = ((currentRating * currentNumOfRating) + rating) / (currentNumOfRating + 1);

    doctor.rating = Number(newRating.toFixed(1));
    doctor.numberOfRating ++;

    await doctor.save();

    res.status(200).json(doctor);
    
  }catch (error) {
        if (!error.statusCode) {
          error.statusCode = 500;
        }
        next(error);
      }
})

module.exports = router;