

const mongoose = require("mongoose");


// Doctor, patient and case

exports.doctorSchema = new mongoose.Schema({
  dId:{type:Number, required:true, unique:true},
  name:{type: String, required:true},
  email: {
        type: String,
        trim: true,
        unique: true,
        validate: {
            validator: function(v) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: "Please enter a valid email"
        },
        required: [true, "Email required"]
    },
  casecount: {type: Number, default:0}
});

exports.patientSchema = new mongoose.Schema({
  pid: {type:Number, required: [true, 'pid is required'], unique: true},
  name: {type:String, required: [true, 'name is required']},
  email: {
      type: String,
      trim: true,
      unique: true,
      validate: {
          validator: function(v) {
              return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
          },
          message: "Please enter a valid email"
      },
      required: [true, "Email required"]
  },
  gender: {type:String, required: [true, 'gender is required (male/female/other).'], enum: ['male', 'female', 'other']},
  age: {type:Number, required: [true, 'age is required'], min:0, max:150}
}, {timestamps: true});

exports.caseSchema = new mongoose.Schema({
  pid:         {type:Number, required: [true, 'pid is required']},
  doctorId:    {type:Number, required: [true, "Doctor's id is required"]},
  description: String
}, {timestamps: true});
