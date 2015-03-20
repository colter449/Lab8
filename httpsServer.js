var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
var http = require('http');
var fs = require('fs');
var url = require('url');
var MongoClient = require('mongodb').MongoClient;
var ROOT_DIR = "html/";
var readline = require('readline');
var basicAuth = require('basic-auth-connect');

var app = express();
var options = {
	host: '52.11.81.12',
	key: fs.readFileSync('ssl/server.key'),
	cert: fs.readFileSync('ssl/server.crt')
};

var auth= basicAuth(function(user,pass) {
 return((user==='cs360') && (pass=== 'test'));
});

http.createServer(app).listen(80);
https.createServer(options, app).listen(443);
app.use('/', express.static('./html',{maxAge: 60*60*1000}));
app.use(bodyParser());
console.log("HERE");

app.get('/comment',function(req,res){
	console.log("in comment route");
	var itemArrOut = "";
	setTimeout(MongoClient.connect("mongodb://localhost/weather",function(err,db){
		if(err) throw err;
		db.collection("comments",function(err,comments){
			comments.find(function(err,items){
				items.toArray(function(err,itemArr){
				itemArrOut = itemArr;
				res.writeHead(200);
				res.end(JSON.stringify(itemArr));

				});
			
			});
		});
	}),3000);
	
});
app.post('/comment',auth, function(req,res){

	
	console.log("in POST comment route");
	console.log(req.body);
	console.log(req.body.Name);
	console.log(req.body.Comment);

	MongoClient.connect("mongodb://localhost/weather",function(err,db){
		if(err) throw err;
		db.collection('comments').insert(req.body,function(err,records){
			console.log("record added");
			});
	res.status(200);
	res.end();
	});
});

app.get('/',function(req,res){
	res.send("Get Index");
});
app.get('/getCity:test',function (req,res){
	console.log("in getCity");
	console.log(req.params.test);
	
	
	
	var myRe = new RegExp("^"+req.params.test);

	console.log(myRe);
	
	
	var jsonresult = []
	fs.readFile('cities.dat.txt',function(err,data){
		if(err) throw err;
		cities = data.toString().split("\n");
		
		
		for(var i = 0; i < cities.length; i++){
			var result = cities[i].search(myRe);
			
			if(result != -1)
			{
				console.log("pushing: " + cities[i]);
				jsonresult.push({city:cities[i]});
			}
			console.log(JSON.stringify(jsonresult));
		}
		res.writeHead(200);
		res.end(JSON.stringify(jsonresult));
	});
	

});
