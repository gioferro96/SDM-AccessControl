const fetch = require('node-fetch');
var fs = require('fs');
var cors = require('cors');

function checkStatus(res) {
  if (res.statusCode >= 200 && res.statusCode < 300) { // res.status >= 200 && res.status < 300
      return res;
  } else {
      console.log("Thowing error for status code: " + res.statusCode)
      throw Error(res.statusCode);
  }
}

module.exports = function(app){
  app.use(cors());
  app.get('/send_client_data/:p', function (req, res){
    
    res.header("Access-Control-Allow-Origin", "*");
    
    var p = req.params.p.split("-");
    console.log("Making reques for tempData with policy " + p[2]);
    


    var userid = p[0].split(",")[0];
    var upname = p[0].split(",")[1]; 
    var id = p[1];
    var policy = p[2];
    var type = p[3];
    var info = p[4];
    
    console.log(policy)

    let actual_policy = "'" + policy + "'"
    console.log("Policy: " + actual_policy);
    //let pk = fs.readFileSync('.key-store/' + p[1] + '_public_key', 'hex');
    let to_encrypt = 'temp-data';
    let enc_file = 'enc_file';
    console.log(info)
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
    fetch('http://localhost:4000/tempData', {
      method: 'POST',
      body: 'uploadername=' + upname + '&username=' + policy + '&type=' + type + '&data=' + enc_data,
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

  .get('/get_patients', function (req, res){
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

  .get('/get_wactors', function (req, res){
    fetch('http://localhost:4000/get_all_write_actors', {
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
  });
}
