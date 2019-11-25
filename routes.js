const fetch = require('node-fetch');
var fs = require('fs')

function checkStatus(res) {
  if (res.statusCode >= 200 && res.statusCode < 300) { // res.status >= 200 && res.status < 300
      console.log('Status code OK: ' + res.statusCode)
      return res;
  } else {
      console.log("Thowing error for status code: " + res.statusCode)
      throw Error(res.statusCode);
  }
}

module.exports = function(app){

  app.get('/get_data_to_verify/:id', function (req, res){
    console.log("Making reques for tempData with id " + req.params.id)
    fetch('http://localhost:4000/tempData', {
      method: 'SEARCH',
      body:    'id=' + req.params.id,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    .then(checkStatus(res))
    .then(resp => resp.json()) // Transform the data into json
    .then(data => {
      console.log("Data received")
      res.send(data)
    }, err => {console.log("Error:" + err); res.send("Error: " +  err);})
    .catch(err => console.log("Error: Status Code = " + err))
  })
  .get('/get_key/:p', function(req, res){
    var p = req.params.p.split("-");
    console.log(p)
    console.log("Making request for genKey with name " + p[0])
    console.log("Attributes: " + p[1]);
    fetch('http://localhost:5000/genKey', {
      method: 'SEARCH',
      body:  'name=' + p[0] + '&attributes=' + p[1],
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    .then(checkStatus(res)).catch(err => console.log("Error: Status Code = " + err))
    .then(resp => resp.json()) // Transform the data into json
    .then(data => {
      console.log("Data received")
      
      let fileNamePrivate = '.key-store/' + p[0] + '_private_key';
      let fileNamePublic = '.key-store/' +  p[0] + '_public_key';

      fs.writeFileSync(fileNamePrivate, data.private_key, 'hex');
      fs.writeFileSync(fileNamePublic, data.public_key, 'hex');

      res.send("KEY-OK")
    }, err => {console.log("Error while transforming data to json:" + err); res.send("Error: " +  err);})
  })
  .get('/add_data/:p', function (req, res){
    var p = req.params.p.split("-");
    console.log(p)
    console.log("Making request for data with id " + p[0])
    console.log("Type: " + p[2]);
    console.log("Info: " + p[3]);
    //let pk = fs.readFileSync('.key-store/' + p[1] + '_public_key', 'hex');
    let to_encrypt = 'temp-data'
    let enc_file = 'enc_file'
    fs.writeFileSync(to_encrypt, p[1], 'hex');
    let policy = "'Enschede'";
    const { execSync } = require('child_process');
					execSync('cpabe-enc -o ' + enc_file + ' .key-store/' + p[1] + '_public_key ' + to_encrypt + ' ' + policy, (err, stdout, stderr) => {
					  if (err) {
                console.log("Cannot encrypt, problem");
                res.send("Error");
					    return;
					  }
          });
          
    let enc_data = fs.readFileSync(enc_file, 'hex');
    
    fetch('http://localhost:4000/data', {
      method: 'POST',
      body:    'id=' + p[0] + '&type=' + p[2] + '&data=' + enc_data,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    .then(checkStatus(res))
    .then(resp => resp.text()) // Transform the data into text
    .then(data => {
      console.log(data);
      if(data == "ok"){
        console.log("Data received")
        res.send("WRITE-OK");
      }else{
        console.log("Error");
        res.send("Error");
      }
    }, err => {console.log("Error:" + err); res.send("Error: " +  err);})
    .catch(err => console.log("Error: Status Code = " + err))
  })
  .get('/get_all', function (req, res){
    fetch('http://localhost:4000/get_all', {
      method: 'GET',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    .then(checkStatus(res))
    .then(resp => resp.json()) // Transform the data into json
    .then(data => {
      console.log("Data received")
      console.log(data)
      res.send(data)
    }, err => {console.log("Error:" + err); res.send("Error: " +  err);})
    .catch(err => console.log("Error: Status Code = " + err))
  })
  /*
  app.get('/get_ehr/:parameters', function(req, res){
    abac.get_ehr(req, res);
  });
  app.get('/add_ehr/:ehr', function(req, res){
    abac.add_ehr(req, res);
  });
  app.get('/get_all_state/:parameters', function(req, res){
    abac.get_all_state(req, res);
  });
  app.get('/update_ehr/:ehr', function(req, res){
    abac.update_ehr(req, res);
  });
  app.get('/update_consent/:ehr', function(req, res){
    abac.update_consent(req, res);
  });
  app.get('/track_ehr/:ehr', function(req, res){
    abac.track_ehr(req, res);
  });*/
}
