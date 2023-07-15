const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const AppointmentSchema=new Schema({
    type:{
        type:String,
        required: true,
        enum: ['Physical', 'Online']
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'completed']
      },
    createdAt: {
        type:Date,
        default : () => Date.now()
    },
    time:{
        hour: {
            type: Number,
           
            min: 1,
            max: 12
          },
          minute: {
            type: Number,
           
            min: 0,
            max: 59
          },
          meridian: {
            type: String,
            enum: ['AM', 'PM'],
           
          },
    },
    doctorID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
      },  
});
module.exports=mongoose.model("Appointment",AppointmentSchema);



