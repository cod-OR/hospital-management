

//////////////////////////////////////////////////////// Init ////////////////////////////////////////////////////////////////
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const alert=require("alert");
const url = require('url');
const request = require('request');
const app = express();
app.set('view engine', 'ejs');
mongoose.connect("mongodb+srv://onkar:"+process.env.PASSWORD+"@cluster0.fnet9.mongodb.net/myDatabase", { useNewUrlParser:true }, function(err){
  if(err)
    console.log("Cannot connect to DB", err);
  else
    console.log("Connected to DB");
});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

///////////////////////////////////////////// Defining Schemas and Models ////////////////////////////////////////////////////

const doctorSchema = new mongoose.Schema({
  dId:{type:Number, required:true},
  name:{type: String, required:true},
  email: {type:String, required:true},
  casecount: {type: Number, default:0}
});

const patientSchema = new mongoose.Schema({
  pid: {type:Number, required: [true, 'pid is required']},
  name: {type:String, required: [true, 'name is required']},
  email: {type:String, required: [true, 'email is required']},
  gender: {type:String, required: [true, 'gender is required (male/female/other).'], enum: ['male', 'female', 'other']},
  age: {type:Number, required: [true, 'age is required'], min:0, max:150}
}, {timestamps: true});

const caseSchema = new mongoose.Schema({
  pid:         {type:Number, required: [true, 'pid is required']},
  doctorId:    {type:Number, required: [true, "Doctor's id is required"]},
  description: String
}, {timestamps: true});

const Doctor = mongoose.model("doctor",doctorSchema);
const Patient = mongoose.model("patient", patientSchema);
const Case = mongoose.model("case", caseSchema);


////////////////////////////////////////////////// Routes - GET ///////////////////////////////////////////////////////////


app.get("/", function(req, res){
  res.render("home");
});
app.get("/about", function(req, res){
  res.render("about");
});
app.get("/contact", function(req, res){
  res.render("contact");
});

app.get("/newpatient", function(req, res){
  res.render("newpatient");
});

app.get("/newcase", function(req, res){
  res.render("newcase");
});

app.get("/getpid", function(req, res){
  res.render("getpid");
});


///////////////////////////////////////////////// Routes - POST /////////////////////////////////////////////////////////////


app.post("/getpid", function(req, res){
  const mail = req.body.email;
  Patient.findOne({email:mail}, function(err, patient){
    if(err){
      console.log(err);
      const msg= "Some error occured. Please try again.";
      res.render("getpid", {msg:msg});
    }
    else if(patient){
      const msg = "Required pid is " + patient.pid;
      res.render("getpid", {msg:msg});
    }
    else{
      const msg= "No patient with this email exists in the database";
      res.render("getpid", {msg:msg});
    }
  });
});

app.post("/newpatient", function(req, res){
  console.log(baseUrl(req));
  request.post({
      url:baseUrl(req) + "/api/newpatient",
      form: {
        name: req.body.name,
        email: req.body.email,
        gender: req.body.gender,
        age: req.body.age
      }},
      function(err,httpResponse,body){
        const response= JSON.parse(body);
        var msg;
        if(response.status == "OK"){
          msg =response.message + " Your pid is "+response.pid + ".";
        }
        else{
          console.log(response.err.message);
          msg = response.err.message;
        }
        res.render("newpatient", {msg:msg});
      }
  );
});


app.post("/newcase", function(req, res){
  request.post({
      url:baseUrl(req) + "/api/newcase",
      form: {
        pid: req.body.pid,
        description: req.body.description
      }},
      function(err,httpResponse,body){
        const response= JSON.parse(body);
        var msg;
        if(response.status == "OK"){
          msg = response.message;
        }
        else{
          console.log(response.err.message)
          msg = response.err.message;
        }
        res.redirect("/", {msg:msg});
      }
  );
});

////////////////////////////////////////////////////// GET APIs ////////////////////////////////////////////////////////


app.get("/api/patientlist", function(req, res){
  Patient.find({}, {_id:0, __v:0} ,function(err, patients){
    if(err)
      res.send({status:"ERROR",err});
    else
      res.send({status:"OK",patients});
  });
});

app.get("/api/doclist", function(req, res){
  Doctor.find({}, {_id:0} ,function(err, doclist){
    if(err)
      res.send({status:"ERROR",err});
    else
      res.send({status:"OK",doclist});
  });
});

app.get("/api/patienthistory", function(req, res){
  Case.find({pid:req.body.pid},{_id:0, __v:0} ,function(err, cases){
    if(err)
      res.send({status:"ERROR",err});
    else
      res.send({status:"OK",cases});
  });
});

app.get("/api/casecount", function(req, res){
  const requiredPid = req.body.pid;
  Case.find({pid:requiredPid}, function(err, cases){
    if(err)
      res.send({status:"ERROR",err});
    else{
      const size=cases.length;
      res.send({status:"OK","Total number of cases for this patient":size});
    }
  });
});

//////////////////////////////////////////////// POST APIs ///////////////////////////////////////////////////////

app.post("/api/newpatient", function(req, res){

  Patient.countDocuments({}, function(err, cnt){
    if(err)
      res.send({status:"ERROR",err});
    else{
      const newPatient = new Patient({
        pid: cnt,
        name: req.body.name,
        email: req.body.email,
        gender: req.body.gender,
        age: req.body.age
      });
      newPatient.save(function(err){
        if(err){
          console.log(err);
          err.message = "Some error occured, please fill the form accurately."
          res.send({status:"ERROR",err});
        }
        else{
          console.log("Patient registered successfully.");
          res.send({status:"OK", message:"Patient registered successfully.", pid:newPatient.pid});
        }
      });
    }
  });
});


app.post("/api/newcase", function(req, res){
  Patient.findOne({pid:req.body.pid} , function(err,patient){
    if(err){
      res.send({status:"ERROR",err});
    }
    else if(patient){
      Doctor
      .findOne({})
      .sort('casecount')
      .exec(function (err, doc) {
        if(err)
          console.log({status:"ERROR",err});
        else{
          const newCase = new Case({
            pid: req.body.pid,
            doctorId: doc.dId,
            description: req.body.description
          });
          newCase.save(function(err){
            if(err){
              res.send({status:"ERROR",err});
              const name = err.name;
              if(name == "ValidatorError"){
                res.send({status:"ERROR", err:{message: "pid is required. If you do not have one, please register as a new patient."}});
              }
              else{
                console.log(err);
                res.send({status:"ERROR", err:{message: "Some error occured."}});
              }
            }
            else{
              Doctor.updateOne({_id:doc._id},{$inc:{casecount:1}},function(err){
                if(err)
                  console.log({status:"ERROR",err});
              });
              res.send({status:"OK",message:"Case logged Successfully. Assigned Doctor is " + doc.name +"."});
            }
          });
        }
      });
    }
    else{
      res.send({status:"ERROR",err:{message:"No patient with this pid exists."}})
    }
  });
});


//////////////////////////////////////////////// Other ///////////////////////////////////////////////////////

function baseUrl(req) {
  return url.format({
    protocol: req.protocol,
    host: req.get('host')
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, function(){
  console.log("Server started on port "+ PORT);
});



// TODO:
// 6. Frontend
// 7. See if you can replace pid with _id
// 9. What about case closing ?
// 10. Check if adding new patient (and its api) works fine when 0 patients exist
// 13. Check error handling
// 14. newcase api docId bug
// 15. Documentation.

// Fixed:
// 1. All fields are required in forms.
// 2. Validation checks added
// 3. While adding case, that pid should exist
// 4. Age restricted to 0-150
// 5. Add new collection doctor
// 6. Configure to assign the right doctor to each case
// 7. Configure the doctor's info API
// 8. Add admission date to case schema
// 9. Date fields. Case logged date.
// 10. Timestamp done.
// 11. msg alert
