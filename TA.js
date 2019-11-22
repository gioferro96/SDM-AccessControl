var express = require('express');
var bodyParser = require('body-parser');
const fetch = require("node-fetch");
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
	.search((req,res)=>{
		let name = req.body.name;
		let attr = req.body.attributes;
		//console.log(name+" "+attr);
		let url = "http://localhost:4000/checkname/"+name;
		fetch(url)
			.then(body => {
				//console.log("insdie body");
				return body.json();
			})
			.then(data => {
				//console.log(data);
				if(data != null){
					console.log("data != null");
					//system call to create key --> key = cpabe-keygen
					let s = "cpabe-keygen -o "+name+"_priv_key pub_key master_key '"+attr+"'";

					const { execSync } = require('child_process');
					execSync(s, (err, stdout, stderr) => {
					  if (err) {
					    // node couldn't execute the command
					    //console.log("Error cp-abe: "+err);
					    return;
					  }
					});
					let fs = require('fs');
			 		let filename = ""+name+"_priv_key"
					let key = fs.readFileSync(filename, 'hex');
					//console.log("chiave: "+key);
					let t = {
						"public_key": pubkey,
						"id": data,
						"private_key": key
					}
					//console.log(typeof t);
					res.statusCode = 200;
					res.setHeader('Content-Type', 'plain/text');
					res.send(t);
					//maybe delete the key created
				}else{
					res.statusCode = 500;
					res.setHeader('Content-Type', 'plain/text');
					res.send("Error");
				}
			})
			.catch(error =>{
				res.statusCode = 500;
				res.setHeader('Content-Type', 'plain/text');
				res.send("Error");
			});
		
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

