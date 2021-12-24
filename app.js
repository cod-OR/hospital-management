
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const alert=require("alert");
app.set('view engine', 'ejs');
mongoose.connect("mongodb://localhost:27017/hospitalDB", { useNewUrlParser:true });
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const patientSchema = {
  pid: Number,
  name: String,
  email: String,
  gender: String,
  age: Number
};

const caseSchema ={
  pid: Number,
  doctorId: Number,
  description: String
};

const Patient = mongoose.model("patient", patientSchema);
const Case = mongoose.model("case", caseSchema);

app.get("/", function(req, res){
  res.render("home");
});

app.get("/newpatient", function(req, res){
  res.render("newpatient");
});

app.get("/getpid", function(req, res){
  res.render("getpid");
});


app.post("/getpid", function(req, res){
  const mail = req.body.email;

  Patient.findOne({email:mail}, function(err, patient){
    if(err)
      console.log("err");
    else if(patient){
      console.log(patient);
      alert("Your pid is " + patient.pid);
      res.redirect("/");
    }
    else{
      alert("No patient with this email exists in the database");
      res.redirect("/");
    }
  });

});


//   to get a list of all patients
app.get("/patientlist", function(req, res){
  Patient.find({}, function(err, patients){
    res.send(patients);
  });
});

app.get("/patienthistory/:pid", function(req, res){
  Case.find({pid:req.params.pid}, function(err, cases){
    res.send(cases);
  });
});

app.post("/newpatient", function(req, res){
  console.log(req.body);
  Patient.countDocuments({}, function(err, cnt){
    const newPatient = new Patient({
      pid: cnt,
      name: req.body.name,
      email: req.body.email,
      gender: req.body.gender,
      age: req.body.age
    });
    newPatient.save();
    res.redirect("/");
  });
});

app.post("/newpatientapi", function(req, res){
  console.log(req.body);
  Patient.countDocuments({}, function(err, cnt){
    if(err)
      res.send(err);
    else{
      const newPatient = new Patient({
        pid: cnt,
        name: req.body.name,
        email: req.body.email,
        gender: req.body.gender,
        age: req.body.age
      });
      newPatient.save(function(err){
        if(err)
          res.send(err);
        else
          res.send("Patient added successfully");
      });
    }
  });
});


app.get("/newcase", function(req, res){
  res.render("newcase");
});

app.post("/newcase", function(req, res){
  console.log(req.body);
  const newCase = new Case({
    pid: req.body.pid,
    doctorId: getDocId(),
    description: req.body.description
  });
  newCase.save();
  res.redirect("/");
});

app.post("/newcaseapi", function(req, res){
  console.log(req.body);
  const newCase = new Case({
    pid: req.body.pid,
    doctorId: getDocId(),
    description: req.body.description
  });
  newCase.save(function(err){
    if(err)
      res.send(err);
    else
      res.send("New case logged successfully");
  });
});

app.listen(3000, function(){
  console.log("Server started on port 3000");
});


function getpid(){
  return 0;
}

function getDocId(){
  return 0;
}
