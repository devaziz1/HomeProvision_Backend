const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const gmailRegex = /^([\w+]+)(.[\w]{1,})?@gmail\.com$/;
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [gmailRegex, "Please enter a valid Gmail address"],
  },
  password: { type: String, required: true, minLength: 4 },
  address: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
  },
});
module.exports=mongoose.model("User",UserSchema);















// const mongoose = require("mongoose");

// const Schema = mongoose.Schema;

// const patientSchema = new Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true },
//   password: { type: String, required: true, minLength: 4, maxLength: 11 },
// phone_Number:Number,
// medical_history:String,
// blood_Type:String,
//   verified: {
//     type: Boolean,
//     require: true,
//     default: false,
//   },
// });

// module.exports = mongoose.model("Patient",patientSchema);
