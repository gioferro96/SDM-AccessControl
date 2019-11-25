const fetch = require('node-fetch');
var fs = require('fs')

function checkStatus(res) {
  if (res.statusCode >= 200 && res.statusCode < 300) { // res.status >= 200 && res.status < 300
      return res;
  } else {
      console.log("Thowing error for status code: " + res.statusCode)
      throw Error(res.statusCode);
  }
}

module.exports = function(app){

  app.get('/send_client_data/:p', function (req, res){
    
    res.header("Access-Control-Allow-Origin", "*");
    
    var p = req.params.p.split("-");
    console.log("Making reques for tempData with name " + p[0]);
    
    let to_encrypt = p[3];
    let enc_file = 'enc_file';
    let policy = "'" + p[1] + "'";
    fs.writeFileSync(to_encrypt, p[1], 'hex');

    const { execSync } = require('child_process');
    execSync('cpabe-enc -o ' + enc_file + ' .key-store/' + p[1] + '_public_key ' + to_encrypt + ' ' + policy, (err, stdout, stderr) => {
      if (err) {
          console.log("Cannot encrypt, problem");
          res.send("Error");
        return;
      }
    });

    let enc_data = fs.readFileSync(enc_file, 'hex');

    fetch('http://localhost:4000/tempData', {
      method: 'POST',
      body:    'uploadername=' + p[0] + '&username=' + p[1] + '&type=' + p[2] + '&data=' + enc_data,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    .then(checkStatus(res))
    .then(resp => resp.text()) // Transform the data into text
    .then(data => {
      console.log(data);
      if(data == "ok"){
        console.log("Data received");l
        res.send("WRITE-OK");
      }else{
        console.log("Error");
        res.send("Error");
      }
    }, err => {console.log("Error:" + err); res.send("Error: " +  err);})
    .catch(err => console.log("Error: Status Code = " + err))
  })
}
