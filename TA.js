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
exec('cpabe-setup && rm -r .key-store && mkdir .key-store && mv pub_key .key-store/', (err, stdout, stderr) => {
	if (err) {
		// node couldn't execute the command
		return;
	}
	let fs = require('fs');
	let filename = ".key-store/pub_key";
	pubkey = fs.readFileSync(filename, 'hex');
	// the *entire* stdout and stderr (buffered)
	//console.log(`stdout: ${stdout}`);
	//console.log(`stderr: ${stderr}`);
	//console.log(typeof pubkey);
});

app.route('/genKey')
	.search((req,res)=>{ 
		let name = req.body.name;
		let attributes = req.body.attributes.split(',');
		let attr = "'"+name+"' '"+ attributes[0].trim()+"'";
		for (var i = 1; i < attributes.length; i++){
			attr += " '" + attributes[i].trim()+"'";
		}

		console.log(attr);
		let url = "http://localhost:4000/checkname/"+name;
		fetch(url)
			.then(body => {
				//console.log("insdie body");
				return body.json();
			})
			.then(data => {
				console.log(data);
				if(data != null){
					//console.log("data != null");
					//system call to create key --> key = cpabe-keygen
					let s = "cpabe-keygen -o "+name+"_priv_key .key-store/pub_key master_key "+attr;

					const { execSync } = require('child_process');
					execSync(s, (err, stdout, stderr) => {
					  if (err) {
					    // node couldn't execute the command
					    //console.log("Error cp-abe: "+err);
					    return;
					  }
					});
					let fs = require('fs');
			 		let filename = ""+name+"_priv_key";
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
					
					let del = "rm "+filename;
					execSync(del, (err, stdout, stderr) => {
					  if (err) {
					    // node couldn't execute the command
					    //console.log("Error cp-abe: "+err);
					    return;
					  }
					});

				}else{
					res.statusCode = 500;
					res.setHeader('Content-Type', 'plain/text');
					res.send("Error: data is null");
				}
			})
			.catch(error =>{
				res.statusCode = 500;
				res.setHeader('Content-Type', 'plain/text');
				res.send("Error: "+error);
			});
		
	});

app.route('/getParam')
	.get((req,res)=>{
		res.statusCode = 200;
		res.setHeader('Content-Type', 'plain/text');
		let t = {
			"pub_key": pubkey
		}
		res.send(t);
	})

app.listen(port);

//check status
console.log('Server running at http://localhost:' + port);

