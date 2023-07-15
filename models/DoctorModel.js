const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const gmailRegex = /^([\w+]+)(.[\w]{1,})?@gmail\.com$/;
const doctorSchema=new Schema({
    name:{
        type:String,
        required:true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [gmailRegex, 'Please enter a valid Gmail address']
    },
    medicalLicenseNo:{
      type:String,
    },
    gender:{
      type:String,
    },
    specialization:{
      type:String,
    },
    phoneNumber:{
      type:String,
    },
    password: { type: String, required: true, minLength: 4 },
    adminID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    patients:
      [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Patient",
        },
      ],
    verified:{
        type:Boolean,
        required:true,
        default:false,
    }
    
});
module.exports=mongoose.model("Doctor",doctorSchema);




