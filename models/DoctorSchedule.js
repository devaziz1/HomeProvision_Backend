const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const gmailRegex = /^([\w+]+)(.[\w]{1,})?@gmail\.com$/;

const DoctorScheduleSchema=new Schema({
    email: {
        type: String,
        required: true,
        match: [gmailRegex, 'Please enter a valid Gmail address']
      },
      slots:[String],

});
module.exports=mongoose.model("DoctorSchedule", DoctorScheduleSchema);














