var express = require('express');
var bodyParser = require('body-parser');


//instantiate express
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var port = 5000;

//setup system call --> cpabe-setup

app.route('/genKey')
	.get((req,res)=>{
		let attr = req.body.attributes;
		//system call to create key --> key = cpabe-keygen
		// key = 

		//get all the assignments
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/plain');
		res.send(key);
	})
	.post((req,res)=>{
		//create new assignment
		let a = {};
		a["taskId"] = parseInt(req.body.taskId);
		a["assignmentId"] = parseInt(req.body.assignmentId);
		a["workerId"] = parseInt(req.body.workerId);
		a["assignmentResult"] = parseInt(req.body.assignmentResult);
		if (a != undefined){
			assignments.push(a);
			res.statusCode = 200;
			res.setHeader('Content-Type', 'text/plain');
			res.send("Added new assignment");
		}
		else{
			res.statusCode = 500;
			res.setHeader('Content-Type', 'text/plain');
			res.send("Internal server error");
		}
		

	});


app.listen(port);

//check status
console.log('Server running at http://localhost:' + port);

