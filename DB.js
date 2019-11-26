var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
let port = 4000;
let dbConnected = false;
let ids = [];
let mysql = require('mysql');
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "patient"
});

con.connect(function(err) {
	if (err) throw err;
	console.log("Connected!");
	dbConnected = true;
});

app.route('/checkname/:name')
	.get((req,res)=>{
		let uname = req.params.name;
		let sql = "select id from users where name='"+uname+"'";
		con.query(sql, function (err,result) {
			if (err){
				res.statusCode = 500;
				res.setHeader('Content-Type', 'plain/text');
				res.send("Error: "+err);
			}else{
				if (result.length > 0){
					res.statusCode = 200;
					res.setHeader('Content-Type', 'plain/text');
					res.send(""+result[0].id);
				}else{
					res.statusCode = 500;
					res.setHeader('Content-Type', 'plain/text');
					res.send("Error: "+err);
				}
				
			}
		});
	});

app.route('/data')
	.search((req,res)=>{
		let uname = req.body.username;
		let type = req.body.type;
		let id = 0;
		if(dbConnected){
			if(uname != null){
				let sql = "select id from users where name='"+uname+"'";
				con.query(sql, function(err,result) {
					if(err) throw err;
					id = result[0].id;
					
					if(type != null){
						let types = type.split(",");
						let sql = "select uploadDate, type, info from data where userid="+id+" AND type='"+types[0]+"'";
						for (i = 1; i < types.length; i++){
							sql += " OR type='"+types[i]+"'";
						}
						
						con.query(sql, function (err, result) {
							if (err){
								res.statusCode = 500;
								res.setHeader('Content-Type', 'plain/text');
								res.send("Error: "+err);
							}else{
								res.statusCode = 200;
								res.setHeader('Content-Type', 'plain/text');
								res.send(result);
							}
						});
					}else{
						let sql = "select uploadDate, type, info from data where userid="+id;
						con.query(sql, function (err, result) {
							if (err){
								res.statusCode = 500;
								res.setHeader('Content-Type', 'plain/text');
								res.send("Error: "+err);
							}else{
								res.statusCode = 200;
								res.setHeader('Content-Type', 'plain/text');
								res.send(result);
							}
							
						});
					}
				});
			}else{
				res.statusCode = 500;
				res.setHeader('Content-Type', 'plain/text');
				res.send("Error: missing information in the request (username, type)");
			}
		}
	})
	.post((req,res)=>{
		let id = req.body.id;
		let type = req.body.type;
		//check type is unique
		let data = req.body.data;
		if((data != null)&&(type != null)&&(id != null)){
			var dt = new Date();
			let today = dt.getFullYear() + "/" + (dt.getMonth() + 1) + "/" + dt.getDate();
			let sql2 = "insert into data values ("+id+", '"+today+"', '"+type+"', '"+data+"')";
			con.query(sql2, function (err, result) {
				if(err){
					res.statusCode = 500;
					res.setHeader('Content-Type', 'plain/text');
					res.send("Error: "+err);
				}else{
					res.statusCode = 200;
					res.setHeader('Content-Type', 'plain/text');
					res.send("ok");
				}
				
			});
		}else{
			res.statusCode = 500;
			res.setHeader('Content-Type', 'plain/text');
			res.send("Error: missing information in the request (id, type, data)");
		}

	});

app.route('/tempData')
	.search((req,res)=>{
		let id = req.body.id;
		if(id != null){
			let sql = "select id, uploaderName, uploadDate, type, info from tempData where userid="+id;
			con.query(sql, function (err,result) {
				if(err){
					res.statusCode = 500;
					res.setHeader('Content-Type', 'plain/text');
					res.send("Error: "+err);
				}else{
					res.statusCode = 200;
					res.setHeader('Content-Type', 'plain/text');
					res.send(result);
				}
				
			});
		}else{
			res.statusCode = 500;
			res.setHeader('Content-Type', 'plain/text');
			res.send("Error: missing information in the request (id)");
		}
	})
	.post((req,res)=>{
		let upname = req.body.uploadername;
		let uname = req.body.username;
		let type = req.body.type;
		//check type is unique
		let data = req.body.data;
		if((upname != null)&&(uname != null)&&(type != null)&&(data != null)){
			let sql = "select id from users where name='"+uname+"'";
			con.query(sql, function (err, result) {
				if (err){
					res.statusCode = 500;
					res.setHeader('Content-Type', 'plain/text');
					res.send("Error: "+err);
				}else{
					let id = result[0].id;
					var dt = new Date();
					let today = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate();
					let sql2 = "insert into tempData (userid, uploaderName, uploadDate, type, info) values ("+id+", '"+upname+"', '"+today+"', '"+type+"', '"+data+"')";
					console.log(sql2);
					con.query(sql2, function (err, result) {
						if(err) throw err;
						res.statusCode = 200;
						res.setHeader('Content-Type', 'plain/text');
						res.send("ok");
					});
				}
			});
		}else{
			res.statusCode = 500;
			res.setHeader('Content-Type', 'plain/text');
			res.send("Error: missing information in the request (uploadername, username, type, data)");
		}
	})
	.delete((req,res)=>{
		let id = req.body.id;

		if(id != null){
			let sql = "delete from tempData where id="+id;
			con.query(sql, function (err, result) {
				if (err){
					res.statusCode = 500;
					res.setHeader('Content-Type', 'plain/text');
					res.send("Error: "+err);
				}else{
					res.statusCode = 200;
					res.setHeader('Content-Type', 'plain/text');
					res.send("ok");
				}
			});
		}else{
			res.statusCode = 500;
			res.setHeader('Content-Type', 'plain/text');
			res.send("Error: missing information in the request (id)");
		}
	});

app.route('/get_all_patients')
	.get((req,res) => {
		console.log("Request for get all")
		let sql = "select id,name from users where category='patient'";
			con.query(sql, function (err, result) {
				if (err){
					res.statusCode = 500;
					res.setHeader('Content-Type', 'plain/text');
					res.send("Error: "+err);
				}else{
					res.statusCode = 200;
					res.setHeader('Content-Type', 'plain/text');
					res.send(result);
				}
			});
	});

app.route('/get_all_actors')
	.get((req,res) => {
		console.log("Request for get all actors")
		let sql = "select id,name from users where category='doctor' OR category='employer' OR category='insurer'";
			con.query(sql, function (err, result) {
				if (err){
					res.statusCode = 500;
					res.setHeader('Content-Type', 'plain/text');
					res.send("Error: "+err);
				}else{
					res.statusCode = 200;
					res.setHeader('Content-Type', 'plain/text');
					res.send(result);
				}
			});
	});

app.route('/get_all_write_actors')
.get((req,res) => {
	console.log("Request for get all actors")
	let sql = "select id,name from users where category='hospital' OR category='healthclub'";
		con.query(sql, function (err, result) {
			if (err){
				res.statusCode = 500;
				res.setHeader('Content-Type', 'plain/text');
				res.send("Error: "+err);
			}else{
				res.statusCode = 200;
				res.setHeader('Content-Type', 'plain/text');
				res.send(result);
			}
		});
	});

app.route('/user')
	.post((req,res) =>{
		let uname = req.body.name;
		let addr = req.body.address;
		let cat = req.body.category;
		let dob = req.body.dob;
		let id = checkid();
		if((uname!=null)&&(addr!=null)&&(dob!=null)&&(cat!=null)){
			let sql = "insert into users value("+id+", '"+uname+"', '"+dob+"', '"+addr+"', '"+cat+"')";
			con.query(sql, function(err,result) {
				if(err){
					res.statusCode = 500;
					res.setHeader('Content-Type', 'plain/text');
					res.send("Error: "+err);
				}else{
					ids.push(id);
					res.statusCode = 200;
					res.setHeader('Content-Type', 'plain/text');
					res.send("ok");
				}
			});
		}else{
			res.statusCode = 400;
			res.setHeader('Content-Type', 'plain/text');
			res.send("Bad request: some parameters are missing (name, address, category, date of birth)");
		}
		
	});

app.listen(port);
function checkid(){
	let id = 0;
	while (true){
		id = getRndInteger(1,65000);
		if(!ids.includes(id)) return id;
	}
	
}
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

//check status
console.log('Server running at http://localhost:' + port);