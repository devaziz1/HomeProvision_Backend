const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const gmailRegex = /^([\w+]+)(.[\w]{1,})?@gmail\.com$/;
const patientReportSchema=new Schema({
    patientEmail: {
        type: String,
        required: true,
        match: [gmailRegex, 'Please enter a valid Gmail address']
      },
      pdfReport:{
        type: Buffer
      },
      CreatedAt:{
        type:Date,
        default: () => Date.now(),
      }
      
});
module.exports=mongoose.model("PatientReport",patientReportSchema);
















