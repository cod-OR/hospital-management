

//////////////////////////////////////////////////////// Init ////////////////////////////////////////////////////////////////

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
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


///////////////////////////////////////////// Requiring custom modules, Defining Models ////////////////////////////////////////////////////


const routeutils = require("./routeutils.js");
const apiutils = require("./apiutils.js");
const schema = require("./schema.js");

const Doctor = mongoose.model("doctor", schema.doctorSchema);
const Patient = mongoose.model("patient", schema.patientSchema);
const Case = mongoose.model("case", schema.caseSchema);


//////////////////////////////////////////////////  Routes  ///////////////////////////////////////////////////////////


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

// user enters his email id to get back his patient-id
app.post("/getpid", function(req, res){
  routeutils.getpid(req,res,Patient);
});

// to register new patient, required fields - name, email, age, gender
app.post("/newpatient", function(req, res){
  routeutils.newPatient(req,res);
});

// to register a new case for an existing patient. required fields - pid, description
app.post("/newcase", function(req, res){
    routeutils.newCase(req,res);
});

///////////////////////////////////////////////////////// APIs ///////////////////////////////////////////////////////////

// to get a list all existing patients
app.get("/api/patientlist", function(req, res){
    apiutils.sendList(req,res,Patient);
});

// to get a list of all existing doctors
app.get("/api/doclist", function(req, res){
    apiutils.sendList(req,res,Doctor);
});

// to get all the cases of a perticular patient, required field - pid.
app.get("/api/patienthistory", function(req, res){
  apiutils.sendPatienHistory(req,res,Patient, Case);
});

// to get the number of current cases for a perticular patient, required field - pid
app.get("/api/casecount", function(req, res){
  apiutils.sendCaseCount(req,res,Patient);
});

// to register new patient, required fields - name, email, age, gender
app.post("/api/newpatient", function(req, res){
  apiutils.newPatient(req,res,Patient);
});

// to register a new case for an existing patient. required fields - pid, description
app.post("/api/newcase", function(req, res){
  apiutils.newCase(req,res,Patient, Doctor, Case);
});

//////////////////////////////////////////////// Server ///////////////////////////////////////////////////////


const PORT = process.env.PORT || 3000;
app.listen(PORT, function(){
  console.log("Server started on port "+ PORT);
});
