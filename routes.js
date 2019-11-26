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

  // reqeust to the DB the data to be verified for a particular user
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

  .post('/get_key/', function(req, res){
    var name = req.body.name;
    var address = req.body.address;
    var dob = req.body.dob;
    var attributes = req.body.attributes;
    console.log("Making request to DB for user with name " + name);
    console.log(name, address, dob, attributes);

    // add the new user to the database
    fetch('http://localhost:4000/user', {
      method: 'POST',
      body:  'name=' + name + '&address=' + address + '&dob=' + dob + '&category=patient',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    .then(checkStatus(res)).catch(err => console.log("Error: Status Code = " + err))
    .then(resp => resp.text()) // Transform the data into text
    .then(data => {
      if (data == "ok"){
        console.log("Making request to TA for key for user with name " + name)

        // ask the TA to create a new private key for the user
        fetch('http://localhost:5000/genKey', {
        method: 'SEARCH',
        body:  'name=' + name + '&attributes=' + attributes,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
        .then(checkStatus(res)).catch(err => console.log("Error: Status Code = " + err))
        .then(resp => resp.json()) // Transform the data into json
        .then(data => {
          console.log("Data received")
          
          // create private key and write to key-store
          let fileNamePrivate = '.key-store/' + name + '_private_key';
          let fileNamePublic = '.key-store/public_key';

          fs.writeFileSync(fileNamePrivate, data.private_key, 'hex');
          fs.writeFileSync(fileNamePublic, data.public_key, 'hex');

          res.send({status: "KEY-OK", id: data.id})
        }, err => {console.log("Error while transforming data to json:" + err); res.send("Error: " +  err);})
        .catch(err => {console.log('Public Key already exist, not writing again'); res.send({status: "KEY-OK", id: data.id})})
      }else{
      res.send("Error");
    }
    }, err => {console.log("Error while transforming data to json:" + err); res.send("Error: " +  err);})
  })

  // add data to the PHR of the specified user
  .post('/add_data/', function (req, res){
    var id = req.body.id;
    var name = req.body.name;
    var type = req.body.type;
    var info = req.body.data;
    var policy = req.body.policy;
    console.log("Making request to DB for user with name " + name);
    console.log(id, name, type, info, policy);
    
    let actual_policy = "'" + policy + "'"
    console.log("Policy: " + actual_policy);
    //let pk = fs.readFileSync('.key-store/' + p[1] + '_public_key', 'hex');
    let to_encrypt = 'temp-data';
    let enc_file = 'enc_file';
    fs.writeFileSync(to_encrypt, info, 'hex');

    // run encryption
    const { execSync } = require('child_process');
    console.log("Executing command");
    execSync('cpabe-enc -o ' + enc_file + ' .key-store/public_key ' + to_encrypt + ' ' + actual_policy, (err, stdout, stderr) => {
      console.log("Command executed");
      if (err) {
          console.log("Cannot encrypt, problem");
          res.send("Error");
        return;
      }
    });
          
    let enc_data = fs.readFileSync(enc_file, 'hex');

    // add encrypted phr to the database
    fetch('http://localhost:4000/data', {
      method: 'POST',
      body:    'id=' + id + '&type=' + type + '&data=' + enc_data,
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

  // verify temporary data 
  .post('/verify_data/', function (req, res){
    const { execSync } = require('child_process');
    var id = req.body.id;
    var name = req.body.name
    var policy = req.body.policy;
    var verify = req.body.verify;

    console.log(id, policy, verify);
    
    let actual_policy = "'" + policy + "'"
    console.log("Policy: " + actual_policy);
    //let pk = fs.readFileSync('.key-store/' + p[1] + '_public_key', 'hex');
    
    for (var i = 0; i < verify.length; i++){
      let to_decrypt = 'temp-data';
      let enc_file = 'enc_file';
      let dec_file = 'dec_file';
      fs.writeFileSync(to_decrypt, verify[i].info, 'hex');
      
      // run decryption
      execSync('cpabe-dec -o ' + dec_file + ' .key-store/public_key'  + ' .key-store/' + name + '_private_key ' + to_decrypt, (err, stdout, stderr) => {
        if (err) {
            console.log("Cannot decrypt, problem");
            res.send("Error");
          return;
        }
      });

      // run encryption
      execSync('cpabe-enc -o ' + enc_file + ' .key-store/public_key ' + dec_file + ' ' + actual_policy, (err, stdout, stderr) => {
        if (err) {
            console.log("Cannot decrypt, problem");
            res.send("Error");
          return;
        }
      });

      // read encrypted data
      let enc_data = fs.readFileSync(enc_file, 'hex');

      // write encrypted data into user phr
      fetch('http://localhost:4000/data', {
      method: 'POST',
      body: {id: id, type: verify[i].type, data: enc_data},
      headers: { 'Content-Type': 'application/x-www-form-urlencoded',
                 'Access-Control-Allow-Origin': '*'},
      })
      .then(checkStatus(res))
      .then(resp => resp.text()) // Transform the data into json
      .then(data => {
        if (data == "ok"){
          console.log("Making request to TA for key for user with name " + name)
  
          // delete verified data from database
          fetch('http://localhost:4000/tempData', {
          method: 'DELETE',
          body:  'id=' + toVerify.id,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          })
          .then(checkStatus(res)).catch(err => console.log("Error: Status Code = " + err))
          .then(resp => resp.text()) // Transform the data into json
          .then(data => {
            console.log("Data deleted from tempData")
  
            res.send({status: "VERIFY-OK", id: data.id})
          }, err => {console.log("Error while transforming data to json:" + err); res.send("Error: " +  err);})
          .catch(err => {console.log('Public Key already exist, not writing again'); res.send({status: "KEY-OK", id: data.id})})
        }else{
          res.send("Error");
        }
        console.log("Data received")
        console.log(data)
        res.send(data)
      }, err => {console.log("Error:" + err); res.send("Error: " +  err);})
      .catch(err => console.log("Error: Status Code = " + err))

      // delete temporary files
      let del = "rm " + dec_file + ' ' + enc_file + ' ' + temp_data;
      execSync(del, (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          //console.log("Error cp-abe: "+err);
          return;
        }
      });
    }

    res.send("VERIFY-OK");
    
  })

  .get('/get_all', function (req, res){
    fetch('http://localhost:4000/get_all_patients', {
      method: 'GET',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded',
                 'Access-Control-Allow-Origin': '*'},
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
}
