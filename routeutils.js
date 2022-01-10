

const url = require('url');
const request = require('request');

exports.getpid = function getpid(req, res, Patient){
  const mail = req.body.email;
  Patient.findOne({email:mail}, function(err, patient){
    var msg;
    if(err){
      console.log(err);
      msg= "Some error occured. Please try again.";
    }
    else if(patient){
      msg = "Required pid is " + patient.pid;
    }
    else{
      msg= "No patient with this email exists in the database";
    }
    res.render("getpid", {msg:msg});
  });
}


exports.newPatient = function (req, res){
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
}

exports.newCase = function(req, res){
  request.post({
      url:baseUrl(req) + "/api/newcase",
      form: {
        pid: req.body.pid,
        description: req.body.description
      }},
      function(err,httpResponse,body){
        const response= JSON.parse(body);
        var msg;
        if(response.status === "OK"){
          msg = response.message;
        }
        else{
          console.log(response.err.message)
          msg = response.err.message;
        }
        res.render("newcase", {msg:msg});
      }
  );
}



function baseUrl(req) {
  return url.format({
    protocol: req.protocol,
    host: req.get('host')
  });
}
