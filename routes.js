//var user = require('./controller.js');
const fetch = require('node-fetch');

module.exports = function(app){

  app.get('/get_data_to_verify/:id', function (req, res){
    console.log("Making reques for tempData with id " + req.params.id)
    fetch('http://localhost:4000/tempData', {
      method: 'SEARCH',
      body:    'id='+req.params.id,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) {
      console.log("Data received")
      res.send(data)
    }, err => {console.log("Error:" + err); res.send("Error: " +  err);})
  });
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
