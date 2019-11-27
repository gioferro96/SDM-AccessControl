const fetch = require('node-fetch');
var fs = require('fs')
var cors = require('cors')

function checkStatus(res, operation) {
  if (res.statusCode >= 200 && res.statusCode < 300) { // res.status >= 200 && res.status < 300
      console.log('Status code OK for operation: ' + operation + ' - code: ' + res.statusCode)
      return res;
  } else {
      console.log("Thowing error for status code: " + res.statusCode)
      throw Error(res.statusCode);
  }
}

module.exports = function(app){
  app.use(cors());

  // reqeust to the DB the data to be verified for a particular user
  app.get('/get_data_to_verify/:id', function (req, res){
    console.log(req.params);
    var id = req.params.id.split('-')[0];
    var name = req.params.id.split('-')[1];
    
    console.log("Making reques for tempData with id " + id);
    console.log("Making reques for tempData with name " + name);

    fetch('http://localhost:4000/tempData', {
      method: 'SEARCH',
      body:    'id=' + id,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    .then(checkStatus(res, 'Looking for tempData'))
    .then(resp => resp.json()) // Transform the data into json
    .then(data => {
      console.log("Data received")
      console.log(data.length);

      for (var i = 0; i < data.length; i++){

        let to_decrypt = 'temp_data';
        let dec_file = 'dec_file';
        console.log(data[i].info);
        fs.writeFileSync(to_decrypt, data[i].info, 'hex');

        // run decryption
        const { execSync } = require('child_process');
        execSync('cpabe-dec -o ' + dec_file + ' .key-store/pub_key'  + ' .key-store/' + name + '_private_key ' + to_decrypt, (err, stdout, stderr) => {
          if (err) {
              console.log("Cannot decrypt, problem");
              res.send("Error");
            return;
          }
        });

        let raw_data = fs.readFileSync(dec_file, 'utf8');
        data[i].info = raw_data;
      }

      console.log(data);
      res.send(data)
    }, err => {console.log("Error:" + err); res.send("Error: " +  err);})
    .catch(err => console.log("Error: Status Code = " + err))
  })

  .post('/get_key/', function(req, res){
    var name = req.query.name;
    var address = req.query.address;
    var dob = req.query.dob;
    var attributes = req.query.attributes;
    console.log("Making request to DB for user with name " + name);
    console.log(name, address, dob, attributes);

    // add the new user to the database
    fetch('http://localhost:4000/user', {
      method: 'POST',
      body:  'name=' + name + '&address=' + address + '&dob=' + dob + '&category=patient',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    .then(checkStatus(res, 'Insertig new user to the DB')).catch(err => console.log("Error: Status Code = " + err))
    .then(resp => resp.text()) // Transform the data into text
    .then(data => {
      console.log(data);
      if (data == "ok"){
        console.log("Making request to TA for key for user with name " + name)

        // ask the TA to create a new private key for the user
        fetch('http://localhost:5000/genKey', {
        method: 'SEARCH',
        body:  'name=' + name + '&attributes=' + attributes,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
        .then(checkStatus(res, 'Asking TA to create new private key for user')).catch(err => console.log("Error: Status Code = " + err))
        .then(resp => resp.json()) // Transform the data into json
        .then(data => {
          console.log("Data received");
          
          // create private key and write to key-store
          let fileNamePrivate = '.key-store/' + name + '_private_key';

          fs.writeFileSync(fileNamePrivate, data.private_key, 'hex');

          res.send({status: "KEY-OK", id: data.id});
        }, err => {console.log("Error while transforming data to json:" + err); res.send("Error: " +  err);})
        .catch(err => {console.log('Public Key already exist, not writing again'); res.send({status: "KEY-OK", id: data.id})})
      }else{
      res.send("Error");
    }
    }, err => {console.log("Error while transforming data to json:" + err); res.send("Error: " +  err);})
  })

  // add data to the PHR of the specified user
  .post('/add_data/', function (req, res){
    var id = req.query.id;
    var name = req.query.name;
    var type = req.query.type;
    var info = req.query.data;
    var policy = req.query.policy;
    console.log("Making request to DB for user with name " + name);
    console.log(id, name, type, info, policy);
    
    let actual_policy = "'" + policy + "'"
    console.log("Policy: " + actual_policy);
    //let pk = fs.readFileSync('.key-store/' + p[1] + '_public_key', 'hex');
    let to_encrypt = 'temp-data';
    let enc_file = 'enc_file';
    fs.writeFileSync(to_encrypt, info, 'utf8');

    // run encryption
    const { execSync } = require('child_process');
    console.log("Executing command");
    execSync('cpabe-enc -o ' + enc_file + ' .key-store/pub_key ' + to_encrypt + ' ' + actual_policy, (err, stdout, stderr) => {
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
    .then(checkStatus(res, 'Adding new encrypted data to the DB')).catch(err => console.log("Error: Status Code = " + err))
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
    var id = req.query.id;
    var name = req.query.name
    var policy = req.query.policy;
    var length = req.query.length;
    var verify;
    if (length == 1){
      verify = JSON.parse(req.query.verify)
    }else{
      verify = req.query.verify;
    }
     //JSON.parse(req.query.verify); //check if it's correct to parse to JSON here since verify should be an array

    console.log(id, policy, verify, length);
    
    let actual_policy = "'" + policy + "'"
    console.log("Policy: " + actual_policy);
    //let pk = fs.readFileSync('.key-store/' + p[1] + '_public_key', 'hex');

    console.log('Length of data is:' + length);

    for (var i = 0; i < parseInt(length); i++){
      console.log(i, parseInt(length));
      let to_encrypt = 'temp_data';
      let enc_file = 'enc_file';

      var element;
      if (length == 1){
        element = verify;
      }else{
        element = JSON.parse(verify[i]);
      }
      
      console.log('Info to verify:' + element.info);
      fs.writeFileSync(to_encrypt, element.info, 'utf8');

      // run encryption
      execSync('cpabe-enc -o ' + enc_file + ' .key-store/pub_key ' + to_encrypt + ' ' + actual_policy, (err, stdout, stderr) => {
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
      body: 'id=' + id + '&type=' +  element.type + '&data=' + enc_data,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded',
                 'Access-Control-Allow-Origin': '*'},
      })
      .then(checkStatus(res, 'Adding verified data to the DB')).catch(err => console.log("Error: Status Code = " + err))
      .then(resp => resp.text()) // Transform the data into text
      .then(dataDBAdd => {

        if (dataDBAdd == "ok"){
          console.log("Making request to TA for key for user with name " + name)
  
          // delete verified data from database
          fetch('http://localhost:4000/tempData', {
          method: 'DELETE',
          body:  'id=' + element.id,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          })
          .then(checkStatus(res, 'Deleting verified data from temporary storage')).catch(err => console.log("Error: Status Code = " + err))
          .then(resp => resp.text()) // Transform the data into text
          .then(dataDBDel => {

            if (dataDBDel == 'ok'){
              console.log("Data deleted from tempData");
              console.log(i, parseInt(length));
              if (i != length-1){
                console.log("Going on with the next one");
              }else{
                console.log('Delete from tempData finished');
              }
            }else{
              res.send('Error');
            }

          }, err => {console.log("Error while transforming data to json:" + err); res.send("Error: " +  err);})
          .catch(err => {console.log('Error'); res.send({status: 'Error'})})

        }else{
          res.send("Error");
        }

      }, err => {console.log("Error:" + err); res.send("Error: " +  err);})
      .catch(err => console.log("Error: Status Code = " + err));
      
      // delete temporary files
      let del = "rm " + enc_file + ' ' + to_encrypt;
      /*execSync(del, (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          //console.log("Error cp-abe: "+err);
          return;
        }
      });*/
    }

    res.send({status: "VERIFY-OK"})
   
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
