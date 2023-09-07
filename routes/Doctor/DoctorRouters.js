const express = require("express");
require("dotenv").config();
const app = express();
const argon2 = require("argon2");
const Admin = require("../../models/AdminModel");
const bcrypt = require("bcryptjs");
let jwt = require("jsonwebtoken");

const Doctor = require("../../models/DoctorModel");
const DoctorAppointments = require("../../models/AppointmentModel");
const DoctorSchedule = require("../../models/DoctorSchedule");
const Patient = require("../../models/PatientModel");
const Complaint = require("../../models/Complaints");
const PatientReport = require("../../models/PatientReport");
const feedback = require("../../models/FeedbackModel");

const adminController = require("../../controller/adminController");
const { body, validationResult } = require("express-validator");
const router = express.Router();

app.use(express.json());

const doctorController = require("../../controller/doctorController");
const Prescription = require("../../models/Prescription");

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
      const doctor = await Doctor.findOne({ email });
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

router.put("/updateSchedule", async (req, res, next) => {
  try {
    const { email, selectedSlots } = req.body;

    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    doctor.slots = selectedSlots;
    await doctor.save();

    return res
      .status(200)
      .json({ message: "Doctor slots updated successfully" });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
});

router.get("/profile/:email", async (req, res, next) => {
  try {
    const { email } = req.params;
    const doctor = await Doctor.findOne({ email });

    res.json(doctor);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
});

router.get("/appiontments/:email", async (req, res, next) => {
  try {
    const { email } = req.params;
    const doctor = await DoctorAppointments.find({ doctorEmail: email });

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.json(doctor);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
});

router.post("/createPrescription", async (req, res, next) => {
  try {
    const {
      doctorEmail,
      patientEmail,
      description,
      dosage,
      medicineName,
      startDate,
      endDate,
    } = req.body;

    const doctor = Doctor.findOne({ email: doctorEmail });
    const patient = Patient.findOne({ email: patientEmail });
    if (!doctor) {
      const error = new Error("Provide Valid Doctor's Email");
      error.statuscode = 401;
      throw error;
    }
    if (!patient) {
      const error = new Error("Provide Valid Patient's Email");
      error.statuscode = 401;
      throw error;
    }

    const prescription = new Prescription({
      doctorEmail,
      patientEmail,
      description,
      dosage,
      startDate,
      medicineName,
      endDate,
    });

    await prescription.save();
    return res.status(200).json(prescription);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
});

router.get("/getreports/:email", async (req, res, next) => {
  try {
    const email = req.params.email;
    const reports = await PatientReport.find({ doctorEmail: email });

    if (!reports || reports.length === 0) {
      return res.status(404).json({ message: "Reports not found" });
    }

    const reportData = reports.map((report) => {
      return {
        _id: report._id,
        CreatedAt: report.CreatedAt,
        patientEmail: report.patientEmail,
      };
    });

    res.status(200).json(reportData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/provideFeedback", async (req, res, next) => {
  try {
    const {
      doctorEmail,
      patientEmail,
      description,
      reportID,
      
    } = req.body;

    const doctor = Doctor.findOne({ email: doctorEmail });
    const patient = Patient.findOne({ email: patientEmail });
    if (!doctor) {
      const error = new Error("Provide Valid Doctor's Email");
      error.statuscode = 401;
      throw error;
    }
    if (!patient) {
      const error = new Error("Provide Valid Patient's Email");
      error.statuscode = 401;
      throw error;
    }

    const Feedback = new feedback({
      doctorEmail,
      patientEmail,
      description,
      reportID
    });

    await Feedback.save();
    return res.status(200).json(Feedback);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
});

router.get("/getAllPatients/:doctorId", doctorController.getAllPatients);

module.exports = router;
