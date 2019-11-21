var express = require('express');
var bodyParser = require('body-parser');


//instantiate express
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var port = 5000;
let pubkey = "";
//setup system call --> cpabe-setup
const { exec } = require('child_process');
exec('cpabe-setup', (err, stdout, stderr) => {
	if (err) {
		// node couldn't execute the command
		return;
	}
	let fs = require('fs');
	let filename = "pub_key"
	pubkey = fs.readFileSync(filename, 'hex');
	// the *entire* stdout and stderr (buffered)
	//console.log(`stdout: ${stdout}`);
	//console.log(`stderr: ${stderr}`);
});

app.route('/genKey')
	.get((req,res)=>{
		let id = req.body.id;
		let attr = req.body.attributes;
		//system call to create key --> key = cpabe-keygen
		// key = 
		//console.log("GET request:" + req.body.id);
		let s = "cpabe-keygen -o "+id+"_priv_key pub_key master_key '"+attr+"'";

		const { execSync } = require('child_process');
		execSync(s, (err, stdout, stderr) => {
		  if (err) {
		    // node couldn't execute the command
		    return;
		  }

		  // the *entire* stdout and stderr (buffered)
		  //console.log(`stdout: ${stdout}`);
		  //console.log(`stderr: ${stderr}`);
		});
		let fs = require('fs');
 		let filename = ""+id+ "_priv_key"
		let key = fs.readFileSync(filename, 'hex');
		//let tmp = fs.readFileSync(filename, 'utf8');
		//console.log(tmp);
		//get all the assignments
		res.statusCode = 200;
		res.setHeader('Content-Type', 'plain/text');
		res.send(key);
		//maybe delete the key created
	})
	.post((req,res)=>{

	});
app.route('/getParam')
	.get((req,res)=>{
		res.statusCode = 200;
		res.setHeader('Content-Type', 'plain/text');
		res.send(pubkey);
	})

app.listen(port);

//check status
console.log('Server running at http://localhost:' + port);

