const fetch = require('node-fetch');
var fs = require('fs')
var cors = require('cors')
 
function checkStatus(res) {
  if (res.statusCode >= 200 && res.statusCode < 300) { // res.status >= 200 && res.status < 300
      return res;s
  } else {
      console.log("Thowing error for status code: " + res.statusCode)
      throw Error(res.statusCode);
  }
}
 
module.exports = function(app){ 
  app.use(cors()); 

  app.get('/get_client_data/:id', function (req, res){
    
    var p = req.params.id.split(",");
    var target = p[0];
    var actor = p[1];

    console.log("Making requesss for data with name " + target + " " + actor)
    
    fetch('http://localhost:4000/data', {
      method: 'SEARCH',
      body:    'username=' + target,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    .then(checkStatus(res))
    .then(resp => resp.json()) // Transform the data into json
    .then(data => {
      console.log("Data received");
      console.log(data.length);
      
      for (var i = 0; i < data.length; i++){

        let to_decrypt = 'temp_data';
        let dec_file = 'dec_file';
        console.log("Information to write")
        //console.log(data[i].info);
        fs.writeFileSync(to_decrypt, data[i].info, 'hex');

        // run decryption
        const { execSync } = require('child_process');
        try{
          execSync('cpabe-dec -o ' + dec_file + ' .key-store/pub_key'  + ' .key-store/' + actor + '_private_key ' + to_decrypt);
          let raw_data = fs.readFileSync(dec_file, 'utf8');
          data[i].info = raw_data;
          //var data = fs.readFileSync('sample.html');
        } catch (err){
            //console.log(err);
            console.log('Attributes do not satisfy policy')
            data[i].info = 'You do not have the rights to read this record';
        }
        /*execSync('cpabe-dec -o ' + dec_file + ' .key-store/pub_key'  + ' .key-store/' + actor + '_private_key ' + to_decrypt, (err, stdout, stderr) => {
          if (err) {
              console.log("Cannot decrypt, problem");
              //res.send("Error");
            //return;
          }
        });*/

        
      }

      console.log(data);
      res.send(data)
    }, err => {console.log("Error:" + err); res.send("Error: " +  err);})
    .catch(err => console.log("Error: Status Code = " + err))
  })

  
  .post('/get_key/', function(req, res){2

    var uname = req.query.name;
    var address = req.query.address;
    var date = req.query.dob;
    var role = req.query.role;
    var attribute = req.query.attributes;

    /*var p = req.params.p.split(",");
    var uname = p[0];
    var address = p[1];
    var date = p[2];
    var role = p[3];
    var attribute = p[4];*/

    console.log("Making request to DB for user with name " + uname)
    console.log("Role: " + role);
    console.log(uname, address, date, role, attribute)

    fetch('http://localhost:4000/user', {
      method: 'POST',
      body:  'name=' + uname + '&address=' + address + '&dob=' + date + '&category=' + role,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    .then(checkStatus(res)).catch(err => console.log("Error: Status Code = " + err))
    .then(resp => resp.text()) // Transform the data into text
    .then(data => {
      if (data == "ok"){
        console.log("Making request to TA for key for user with name " + uname)
        console.log("Attributes: " + attribute);
        fetch('http://localhost:5000/genKey', {
        method: 'SEARCH',
        body:  'name=' + uname + '&attributes=' + attribute,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
        .then(checkStatus(res)).catch(err => console.log("Error: Status Code = " + err))
        .then(resp => resp.json()) // Transform the data into json
        .then(data => {
          console.log("Data received")
          
          let fileNamePrivate = '.key-store/' + uname + '_private_key';

          fs.writeFileSync(fileNamePrivate, data.private_key, 'hex');

          res.send({status: "KEY-OK", id: data.id})
        }, err => {console.log("Error while transforming data to json:" + err); res.send("Error: " +  err);})
      }else{
      res.send("Error");
    }
    }, err => {console.log("Error while transforming data to json:" + err); res.send("Error: " +  err);})
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
  
  .get('/get_actors', function (req, res){
    fetch('http://localhost:4000/get_all_actors', {
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
