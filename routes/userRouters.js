const express = require("express");
require("dotenv").config();
const app = express();
const argon2 = require("argon2");

let jwt = require("jsonwebtoken");

const User = require("../models/userModel");

const { body, validationResult } = require("express-validator");

const router = express.Router();

app.use(express.json());

router.post("/signup", async (req, res, next) => {
  try {
    const {name, email, password, phone, address } = req.body;
    console.log(req.body);

    const hashedPassword = await argon2.hash(password);

      const existingUser = await User.findOne({ email });

      if(existingUser){
       return res.status(401).json({
         message: "User with this email already exists",
       });
      }

      const newUser = new User({
        name,
        password: hashedPassword,
        email,
        address,
        phone,
      });

      const result = await newUser.save();
   return res.status(200).json({
     message: "inside this API",
     result,
   });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
    try {
      console.log(req.body);


      const { email, password } = req.body;
      const user = await User.findOne({ email });
      

      if (!user) {
      return res.status(401).json({
        message: "Invalid Email Address",
      });
      } else {
        const passwordMatches = await argon2.verify(user.password, password);

        if (!passwordMatches) {
         return res.status(401).json({
           message: "Invalid Password",
         });
        }
        const name = user.name;
       return res.status(200).json({
          email,
          name,
          message: "user Login sucessfull ",
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
