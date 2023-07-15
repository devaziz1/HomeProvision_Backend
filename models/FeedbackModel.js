const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const FeedbackSchema=new Schema({
    description:{
        type:String,
    },
    createdAt: {
        type:Date,
        default : () => Date.now()
    },
    doctorID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
      },
    patientID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
      },
      reportID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalReport',
      }  
});
module.exports=mongoose.model("Feedback",FeedbackSchema);














