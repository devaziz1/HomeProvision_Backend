const mongoose=require("mongoose");
const gmailRegex = /^([\w+]+)(.[\w]{1,})?@gmail\.com$/;
const Schema=mongoose.Schema;
const ComplaintSchema=new Schema({
    description:{
        type:String,
    },
    name:{
        type:String,
    },
    email: {
        type: String,
        required: true,
        match: [gmailRegex, 'Please enter a valid Gmail address']
    },
    role: {
        type: String,
        required: true,
        enum: ['patient', 'doctor']
      },
});
module.exports=mongoose.model("Complaint",ComplaintSchema);














