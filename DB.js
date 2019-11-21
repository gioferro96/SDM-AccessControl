var express = require('express');
var bodyParser = require('body-parser');


//instantiate express
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
let port = 5000;
let dbConnected = false;

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


app.route('/data')
	.get((req,res)=>{
		let id = req.body.id;
		let type = req.body.type;

		if(dbConnected){
			if((id != null)&&(type != null)){
				let types = type.split(",");
				let sql = "select info from data where userid="+id+" AND type='"+types[0]+"'";
				for (i = 1; i < types.length; i++){
					sql += " OR type='"+types[i]+"'";
				}
				console.log(sql);
				con.query(sql, function (err, result) {
					if (err) throw err;
					res.statusCode = 200;
					res.setHeader('Content-Type', 'plain/text');
					res.send(result);
				});
			}else if (id != null){
				let sql = "select info from data where userid="+id;
				con.query(sql, function (err, result) {
					if (err) throw err;
					res.statusCode = 200;
					res.setHeader('Content-Type', 'plain/text');
					res.send(result);
				});
			}else{
				res.statusCode = 400;
				setHeader('Content-Type', 'plain/text');
				res.send("Error: missing information in the request (id, type)");
			}
			
		}else{
			res.statusCode = 500;
			setHeader('Content-Type', 'plain/text');
			res.send("Error: no db connection");
		}



	})
	.post((req,res)=>{
		let uname = req.body.username;
		let type = req.body.type;
		//check type is unique
		let data = req.body.data;
		let sql = "select id from users where name='"+uname+"'";
		con.query(sql, function (err, result) {
			if (err) throw err;
			let id = result[0].id;
			var dt = new Date();
			let today = dt.getFullYear() + "/" + (dt.getMonth() + 1) + "/" + dt.getDate();
			let sql2 = "insert into data values ("+id+", '"+today+"', '"+type+"', '"+data+"')";
			con.query(sql2, function (err, result) {
				if(err) throw err;
				res.statusCode = 200;
				res.setHeader('Content-Type', 'plain/text');
				res.send("ok");
			});
		});

	});

app.route('/tempData')
	.get((req,res)=>{
		let id = req.body.id;
		let sql = "select uploaderName, uploadDate, type, info from tempData where userid="+id;
		con.query(sql, function (err,result) {
			if(err) throw err;
			res.statusCode = 200;
			res.setHeader('Content-Type', 'plain/text');
			res.send(result);
		});
	})
	.post((req,res)=>{
		let upname = req.body.uploadername;
		let uname = req.body.username;
		let type = req.body.type;
		//check type is unique
		let data = req.body.data;
		let sql = "select id from users where name='"+uname+"'";
		con.query(sql, function (err, result) {
			if (err) throw err;
			let id = result[0].id;
			var dt = new Date();
			let today = dt.getFullYear() + "/" + (dt.getMonth() + 1) + "/" + dt.getDate();
			let sql2 = "insert into tempData values ("+id+", '"+upname+"', '"+today+"', '"+type+"', '"+data+"')";
			console.log(sql2);
			con.query(sql2, function (err, result) {
				if(err) throw err;
				res.statusCode = 200;
				res.setHeader('Content-Type', 'plain/text');
				res.send("ok");
			});
		});
	});






app.listen(port);

//check status
console.log('Server running at http://localhost:' + port);