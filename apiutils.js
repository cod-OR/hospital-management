



exports.sendList = function sendList(req, res, model){
  model.find({}, {_id:0, __v:0} ,function(err, list){
    if(err)
      res.send({status:"ERROR",err});
    else
      res.send({status:"OK",list});
  });
}



exports.sendPatienHistory = function sendPatienHistory(req, res, Patient, Case){
  if(req.body.pid==null){
      res.send({status:"ERROR",err:{message:"Please enter pid"}});
  }
  else{
    Patient.findOne({pid:req.body.pid}, function(err, patient){
      if(!patient)
        res.send({status:"ERROR",err:{message:"No patient with this pid exists"}});
      else{
        Case.find({pid:req.body.pid},{_id:0, __v:0} ,function(err, cases){
          if(err)
            res.send({status:"ERROR",err});
          else
            res.send({status:"OK",cases});
        });
      }
    })
  }
}

exports.sendCaseCount = function sendCaseCount(req, res, Patient){
  const requiredPid = req.body.pid;
  if(req.body.pid==null){
      res.send({status:"ERROR",err:{message:"Please enter pid"}});
  }
  else{
  Patient.findOne({pid:requiredPid}, function(err, patient){
    if(!patient)
      res.send({status:"ERROR",err:{message:"No patient with this pid exists"}});
    else{
      Case.find({pid:requiredPid}, function(err, cases){
        if(err)
          res.send({status:"ERROR",err});
        else{
          const size=cases.length;
          res.send({status:"OK","totalcases":size});
        }
      });
    }
  })
  }
}


exports.newPatient = function newPatient(req,res,Patient){

  Patient.countDocuments({}, function(err, cnt){
    if(err)
      res.send({status:"ERROR",err});
    else{
      Patient.findOne({email:req.body.email},function(err,duplicate){
        if(duplicate)
        {
          const err = {message : "This email id already exists in the database."};
          res.send({status:"ERROR",err});
        }
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
              err.message = "Some error occured, please fill the form accurately.";
              res.send({status:"ERROR",err});
            }
            else{
              console.log("Patient registered successfully.");
              res.send({status:"OK", message:"Patient registered successfully.", pid:newPatient.pid});
            }
          });
        }
      });
    }
  });

}


exports.newCase = function newCase(req, res, Patient, Doctor, Case){
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
      res.send({status:"ERROR",err:{message:"No patient with this pid exists."}});
    }
  });
}
