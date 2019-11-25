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
    console.log("Making reques for tempData with name " + p[0])
    
    fetch('http://localhost:4000/tempData', {
      method: 'POST',
      body:    'uploadername=' + p[0] + '&username=' + p[1] + '&type=' + p[2] + '&data=' + p[3],
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
  .get('/get_pub_key', function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    console.log("inside route")

    fetch('http://localhost:5000/getParam', {
      method: 'GET',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    .then(checkStatus(res))
    .then(resp => resp.json()) // Transform the data into json
    .then(data => {
      console.log("Data received")
      res.send("KEY-OK")
    }, err => {console.log("Error while transforming data to json:" + err); res.send("Error: " +  err);})
    .catch(err => console.log("Error: Status Code = " + err))
  });

}
