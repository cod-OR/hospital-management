

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

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

const patient = mongoose.model("patient", patientSchema);
const _case = mongoose.model("case", caseSchema);


app.get("/", function(req, res){
  res.render("home");
});

app.get("/newPatient", function(req, res){
  res.render("newpatient");
});

app.post("/newPatient", function(req, res){
  console.log(req.body);
});

app.get("/newCase", function(req, res){
  res.render("newcase");
});
app.post("/newCase", function(req, res){
  console.log(req.body);
});

app.listen(3000, function(){
  console.log("Server started on port 3000");
});
