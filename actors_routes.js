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
    
    console.log("Making reques for tempData with name " + req.params.id)
    
    fetch('http://localhost:4000/data', {
      method: 'SEARCH',
      body:    'username=' + req.params.id,
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
  
  .get('/get_key/:p', function(req, res){2

    var p = req.params.p.split(",");
    console.log(p[0])
    console.log("Making request to DB for user with name " + p[0])
    console.log("Attributes: " + p[4]);
    fetch('http://localhost:4000/user', {
      method: 'POST',
      body:  'name=' + p[0] + '&address=' + p[1] + '&dob=' + p[2] + '&category=' + p[3],
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    .then(checkStatus(res)).catch(err => console.log("Error: Status Code = " + err))
    .then(resp => resp.text()) // Transform the data into text
    .then(data => {
      if (data == "ok"){
        console.log("Making request to TA for key for user with name " + p[0])
        console.log("Attributes: " + p[4]);
        fetch('http://localhost:5000/genKey', {
        method: 'SEARCH',
        body:  'name=' + p[0] + '&attributes=' + p[4],
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
