const express = require("express");
require("dotenv").config();
const app = express();
const Admin = require("../../models/AdminModel");
const bcrypt = require("bcryptjs");
let jwt = require("jsonwebtoken");

const Doctor = require("../../models/DoctorModel");
const Patient = require("../../models/PatientModel");
const Complaint = require("../../models/Complaints");

const adminController = require("../../controller/adminController");
const { body, validationResult } = require("express-validator");
const router = express.Router();

app.use(express.json());

router.post("/signup", async (req, res, next) => {
  console.log(req.body);
  const { name, email, password } = req.body;
  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      res.status(401).json({ mesg: "This Email Already Exist" });
    } else {
      const hashpasword = await bcrypt.hash(password, 12);
      const admin = new Admin({
        name,
        password: hashpasword,
        email,
      });

      const result = await admin.save();

      const token = jwt.sign(
        {
          userId: result._id,
        },
        "auth user",
        {
          expiresIn: "1h",
        }
      );
      res.status(200).json({
        mesg: "Admin created",
        AdminId: result._id,
        accessToken: token,
      });
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
      .withMessage("Enter a valid email")
      .normalizeEmail(),
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
      const admin = await Admin.findOne({ email });
      const token = jwt.sign({ admin }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "300s",
      });

      if (!admin) {
        const error = new Error("Invalid Email!");
        error.statuscode = 401;
        throw error;
      } else {
        const isPasswordMatch = await bcrypt.compare(password, admin.password);
        if (!isPasswordMatch) {
          const error = new Error("Invalid Password!");
          error.statuscode = 401;
          throw error;
        }
        res.status(200).json({
          message: "Admin Login sucessful ",
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

// authorization
router.post("/profile", verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.ACCESS_TOKEN_SECRET, (err, authData) => {
    if (err) {
      res.send({ result: "Invalid Token" });
    } else {
      res.json({
        message: "Profile access",
        authData,
      });
    }
  });
});

// Token Authorization

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];
    req.token = token;
    next();
  } else {
    res.send({
      result: "Token is not Valid",
    });
  }
}

router.get("/profile",async (req,res,next) =>{
  try{
    const email = "admin001@gmail.com";
    const admin = await Admin.findOne({ email });
    res.status(200).json(admin);

  }catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
})

router.post(
  "/doctor/signup",
  [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Enter a valid email")
      .normalizeEmail(),
    body("password").trim().notEmpty().withMessage("Password is required"),
  ],
  async (req, res, next) => {
    console.log(req.body);
    try {
      const {
        name,
        email,
        password,
        medicalLicenseNo,
        specialization,
        gender,
        phoneNumber,
      } = req.body;

      const adminID = "6463e56b2621ab5034d067d8";

      const admin = await Admin.findById(adminID);

      if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
      }
      const existingDoctor = await Doctor.findOne({ email });

      if (existingDoctor) {
        const error = new Error("This Email Already Exist!!!");
        error.statuscode = 401;
        throw error;
      } else {
        // const hashpasword = await bcrypt.hash(password, 12);
        const doctor = new Doctor({
          name,
          password,
          email,
          medicalLicenseNo,
          specialization,
          gender,
          phoneNumber,
          adminID: admin._id,
        });

        const result = await doctor.save();
        admin.doctors.push(doctor._id);
        await doctor.save();
        await admin.save();

        const token = jwt.sign(
          {
            userId: result._id,
          },
          "user",
          {
            expiresIn: "1h",
          }
        );
        res.status(201).json({ mesg: "Doctor created", doctorId: result._id });
      }
    } catch (error) {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    }
  }
);

router.post("/doctor/login", async (req, res, next) => {
  console.log(req.body);
  const { email } = req.body;
  try {
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      const error = new Error("Doctor could not be found.");
      error.statuscode = 401;
      throw error;
    }
    res.status(200).json({
      message: "Doctor Login sucessful ",
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
});

router.patch("/doctor/update", async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      specialization,
      medicalLicenseNo,
      gender,
      phoneNumber,
    } = req.body;
    const doctor = await Doctor.findOne({ email });
    console.log(doctor);
    doctor.name = name;
    doctor.password = password;
    doctor.specialization = specialization;
    doctor.medicalLicenseNo = medicalLicenseNo;
    doctor.gender = gender;
    doctor.phoneNumber = phoneNumber;

    const result = await doctor.save();

    res.status(200).json({ message: "Doctor updated ", doctors: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/doctor/search/:email", async (req,res,next)=>{

  try{
    const {email} = req.params;
    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
      const error = new Error("Please Provide Valid Email");
      error.statuscode = 401;
      throw error;
    }
    
    res.status(200).json(doctor);

  } catch (error) {
    if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
  }

})

router.get("/patient/search/:email", async (req,res,next)=>{

  try{
    const {email} = req.params;
    const patient = await Patient.findOne({ email });

    if (!patient) {
      const error = new Error("Please Provide Valid Email");
      error.statuscode = 401;
      throw error;
    }
    
    res.status(200).json(patient);

  } catch (error) {
    if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
  }

})

router.get("/getAllDoctor/:adminId", verifyToken, async (req, res, next) => {
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

router.delete("/doctor/delete/:email", async (req, res, next) => {
  const { email } = req.params;

  try {
    const user = await Doctor.findOneAndDelete({ email });
    if (!user) {
      const error = new Error("Doctor could not be found.");
      error.statuscode = 401;
      throw error;
    }
    console.log("Doctor Deleted");
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.post("/createSession", adminController.createSession);

router.post("/patient/signup", async (req, res, next) => {
  console.log(req.body);
  try {
    const {
      name,
      email,
      password,
      medical_history,
      gender,
      phoneNumber,
      doctorID,
    } = req.body;

    const adminID = "6463e56b2621ab5034d067d8";

    const admin = await Admin.findById(adminID);
    const doctor = await Doctor.findById(doctorID);

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    const existingPatient = await Patient.findOne({ email });

    if (existingPatient) {
      const error = new Error("This Email Already Exist!!!");
        error.statuscode = 401;
        throw error;
    } else {
      // const hashpasword = await bcrypt.hash(password, 12);
      const patient = new Patient({
        name,
        password,
        email,
        medical_history,
        gender,
        phoneNumber,
        adminID: admin._id,
        doctorID: doctor._id,
      });

      const result = await patient.save();
      admin.patients.push(patient._id);
      doctor.patients.push(patient._id);
      await patient.save();
      await admin.save();
      await doctor.save();

      const token = jwt.sign(
        {
          userId: result._id,
        },
        "somth",
        {
          expiresIn: "1h",
        }
      );
      res.status(201).json({ mesg: "Patient created", adminId: result._id });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
});
router.post("/patient/login", adminController.Patientlogin);
router.get("/getAllPatient/:adminId", adminController.getAllPatient);
router.delete("/patient/delete/:email", adminController.deletePatient);

router.get("/getAllComplaints", adminController.getAllComaplints);

module.exports = router;
