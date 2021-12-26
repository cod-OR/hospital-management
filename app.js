


//////////////////////////////////////////////////////// Init ////////////////////////////////////////////////////////////////

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const alert=require("alert");
app.set('view engine', 'ejs');
mongoose.connect("mongodb://localhost:27017/hospitalDB", { useNewUrlParser:true });
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
});

const caseSchema = new mongoose.Schema({
  pid:         {type:Number, required: [true, 'pid is required']},
  doctorId:    {type:Number, required: [true, "Doctor's id is required"]},
  description: String
});

const Doctor = mongoose.model("doctor",doctorSchema);
const Patient = mongoose.model("patient", patientSchema);
const Case = mongoose.model("case", caseSchema);


////////////////////////////////////////////////// GET requests ///////////////////////////////////////////////////////////


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


///////////////////////////////////////////////// POST requests /////////////////////////////////////////////////////////////


app.post("/getpid", function(req, res){
  const mail = req.body.email;
  Patient.findOne({email:mail}, function(err, patient){
    if(err){
      console.log(err);
      alert("Some error occured. Please try again.");
    }
    else if(patient){
      alert("Your pid is " + patient.pid);
      res.redirect("/");
    }
    else{
      alert("No patient with this email exists in the database");
      res.redirect("/");
    }
  });
});

app.post("/newpatient", function(req, res){
  Patient.countDocuments({}, function(err, cnt){
    const newPatient = new Patient({
      pid: cnt,
      name: req.body.name,
      email: req.body.email,
      gender: req.body.gender,
      age: req.body.age
    });
    newPatient.save();
    alert("Your pid is " + newPatient.pid);
    res.redirect("/");
  });
});

app.post("/newcase", function(req, res){

  Patient.findOne({pid:req.body.pid} , function(err,patient){
    if(err){
      console.log(err);
    }
    else if(patient){
      Doctor
      .findOne({})
      .sort('casecount')
      .exec(function (err, doc) {
        if(err)
          console.log(err);
        else{
          const newCase = new Case({
            pid: req.body.pid,
            doctorId: doc.dId,
            description: req.body.description
          });
          newCase.save(function(err){
            if(err){
              res.send(err);
              const name = err.name;
              if(name == "ValidatorError"){
                alert("pid is required. If you do not have one, please add a new patient.");
                res.redirect("/");
              }
              else{
                console.log(err);
              }
            }
            else{
              Doctor.update({_id:doc._id},{$inc:{casecount:1}},function(err){
                console.log(err);
              });
              alert("Case logged Successfully. Please visit " + doc.name +".");
              res.redirect("/");
            }
          });
        }
      });
    }
    else{
      alert("No patient with this pid exists.")
      res.redirect("/");
    }
  });
});

////////////////////////////////////////////////////// GET API ////////////////////////////////////////////////////////

app.get("/patientlist", function(req, res){
  Patient.find({}, {_id:0, __v:0} ,function(err, patients){
    if(err)
      res.send(err);
    else
      res.send(patients);
  });
});

app.get("/doclist", function(req, res){
  Doctor.find({}, {_id:0} ,function(err, doclist){
    if(err)
      res.send(err);
    else
      res.send(doclist);
  });
});

app.get("/patienthistory", function(req, res){
  Case.find({pid:req.body.pid},{_id:0, __v:0} ,function(err, cases){
    if(err)
      res.send(err);
    else
      res.send(cases);
  });
});

app.get("/casecountapi", function(req, res){
  const requiredPid = req.body.pid;
  Case.find({pid:requiredPid}, function(err, cases){
    if(err)
      res.send(err);
    else{
      const size=cases.length;
      res.send({"Number of total cases of this patient":size});
    }
  });
});


//////////////////////////////////////////////// POST API ///////////////////////////////////////////////////////


app.post("/newpatientapi", function(req, res){
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

app.post("/newcaseapi", function(req, res){
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


//////////////////////////////////////////////// Other Utilities ///////////////////////////////////////////////////////

function getdate(){

}

app.listen(3000, function(){
  console.log("Server started on port 3000");
});

// TODO:
// 6. Frontend
// 7. See if you can replace pid with _id
// 8. Date fields. Case logged date.
// 9. What about case closing ?
// 10. Check if adding new patient (and its api) works fine when 0 patients exist

// Fixed:
// 1. All fields are required in forms.
// 2. Validation checks added
// 3. While adding case, that pid should exist
// 4. Age restricted to 0-150
// 5. Add new collection doctor
// 6. Configure to assign the right doctor to each case
// 7. Configure the doctor's info API
