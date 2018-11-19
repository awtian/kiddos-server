var express = require('express');
var https = require('https');
var http = require('http');
var moment = require('moment-timezone');
var moment = require('moment');
var compression = require('compression')
var userCount = 0;
var fs = require('fs');
// var fs = require('./');
process.env.TZ = 'Asia/Jakarta';


var options = {
  key: fs.readFileSync('./privkey.pem'),
  cert: fs.readFileSync('./fullchain.pem')
};

var app = express();

app.use('/scripts', express.static(__dirname + '/scripts'));
app.use('/file', express.static(__dirname));

var  bodyParser = require('body-parser'); 
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(compression());


app.get('/api/impression/id/:id', function(req, res) {
res.header("Access-Control-Allow-Origin", "*");
var goal_id = req.params.id;

var Datastore = require('nedb'),
db = new Datastore({ filename: './database_impression/'+goal_id+'.db' });
db.loadDatabase(function (err) {});


  db.find({}).sort({ nomor: -1 }).exec(function(err, goals) {
    if (err) res.send(err);
    res.json(goals);
  });
  
});


app.get('/api/click/id/:id', function(req, res) {
res.header("Access-Control-Allow-Origin", "*");
var goal_id = req.params.id;

var Datastore = require('nedb'),
db = new Datastore({ filename: './database_click/'+goal_id+'.db' });
db.loadDatabase(function (err) {

});

  db.find({}).sort({ nomor: -1 }).exec(function(err, goals) {
    if (err) res.send(err);
    res.json(goals);
  });
  
});

app.get('/api/action/', function(req, res) {
res.header("Access-Control-Allow-Origin", "*");
var idsite = req.param('id');
var medium = req.param('source');

var Datastore = require('nedb'),
db = new Datastore({ filename: './database_action/'+idsite+'/'+medium+'.db' });
db.loadDatabase(function (err) {

});

  db.find({}).exec(function(err, goals) {
    if (err) res.send(err);
    res.json(goals);
  });
  
});





app.get('/pixel.jpg', function (req, res) {
   var idsite = req.param('id');
   

   var
    hex1pixeljpeg = 'ffd8ffe000104a46494600010101006000600000ffe1001645786966000049492a0008000000000000000000ffdb00430001010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101ffdb00430101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101ffc00011080001000103012200021101031101ffc400150001010000000000000000000000000000000affc40014100100000000000000000000000000000000ffc40014010100000000000000000000000000000000ffc40014110100000000000000000000000000000000ffda000c03010002110311003f00bf8001ffd9',
    buffer1PixelJpeg = new Buffer(hex1pixeljpeg, 'hex');

  res
    .set({
      'Content-Type': 'image/jpeg',
      'Content-Length': buffer1PixelJpeg.length
    })
	
.end(buffer1PixelJpeg,'binary');

var Datastore = require('nedb'),
db = new Datastore({ filename: './database_impression/'+idsite+'.db', timestampData: 'true' });
db.loadDatabase(function (err) {

});


		var hit_time = moment().format('DD-MM-YYYY, hh:mm');
		var id_time = moment().format('DD-MM-YYYY');

		  db.findOne({ _id: id_time }, function (err, doc) {  
		  doc = doc || { _id: id_time, idsite: idsite, counter: 0, first_hit: hit_time };
		  doc.last_hit = hit_time;
		  doc.counter++;
		  db.update({ _id: id_time }, doc, { upsert: true }, function (err, num) {});
          });

});


app.get('/', function (req, res) {
    userCount++;

    res.writeHead(200, { 'Content-Type': 'text/plain' });

    res.write('Hello!\n');

    res.write('We have had ' + userCount + ' visits!\n');

 res.end();
});


app.get('/action/', function (req, res) {

var idsite = req.param('id');
var action = req.param('action');
var source = req.param('source');

   
var Datastore = require('nedb'),
db = new Datastore({ filename: './database_action/'+idsite+'/'+source+'.db', timestampData: 'true' });
db.loadDatabase(function (err) {});


var hit_time = moment().format('DD-MM-YYYY, hh:mm:ss');

db.findOne({ _id: action }, function (err, doc) {  
  doc = doc || { _id: action, idsite: idsite, counter: 0, first_hit: hit_time };
  doc.last_hit = hit_time;
  doc.counter++;
  db.update({ _id: action }, doc, { upsert: true }, function (err, num) {});
});


    res.set('content-type', 'text/javascript');
    res.end();

});



app.get('/redirect/', function (req, res) {
	var redirect_url = req.param('url');
	var encode_url = req.originalUrl;
	var rewrite_url = encode_url.replace('/redirect/?url=', '');
    var data_redirect = rewrite_url;
    var encoded_id = new Buffer(data_redirect).toString('base64');
	var url_id = data_redirect.slice(-13);

var Datastore = require('nedb'),
db = new Datastore({ filename: './database_click/'+ url_id + '.db', timestampData: 'true' });
db.loadDatabase(function (err) {});

var hit_time = moment().format('DD-MM-YYYY, hh:mm:ss');
var id_time = moment().format('DD-MM-YYYY');


	db.findOne({ _id: id_time }, function (err, doc) {  
	  doc = doc || { _id: id_time, click_url: data_redirect, encoded_id: encoded_id, first_hit: hit_time,  counter: 0 };

	  doc.last_hit = hit_time;
	  doc.counter++;
	  db.update({ _id: id_time }, doc, { upsert: true }, function (err, num) {  });
	});
	
	res.status(200);
	res.redirect(rewrite_url);	
    next
        
});


http.createServer(app).listen(3000);
https.createServer(options, app).listen(443);







