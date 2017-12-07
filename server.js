 /******************************************************
 * PLEASE DO NOT EDIT THIS FILE
 * the verification process may break
 * ***************************************************/
/* jshint node: true */

'use strict';

var fs         = require('fs');
var express    = require('express');
var app        = express();
var mongoose   = require('mongoose');
var bodyParser = require('body-parser');

// Set up Mongoose
mongoose.connect("mongodb://mackenzie:mackenzie@ds245755.mlab.com:45755/url-shortener");

// Set up Body parser


// ============
// Schema Setup
// ============
var urlSchema = new mongoose.Schema({
  input: String,
  "short-url": String
});

var Url = mongoose.model("Url", urlSchema);

app.use(bodyParser.urlencoded({ extended: false }));

if (!process.env.DISABLE_XORIGIN) {
  app.use(function(req, res, next) {
    var allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin || '*';
    if(!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1){
         console.log(origin);
         res.setHeader('Access-Control-Allow-Origin', origin);
         res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

app.use('/public', express.static(process.cwd() + '/public'));

app.route('/_api/package.json')
  .get(function(req, res, next) {
    console.log('requested');
    fs.readFile(__dirname + '/package.json', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });
  
app.route('/')
    .get(function(req, res) {
		  res.sendFile(process.cwd() + '/views/index.html');
    })
    .post(function(req, res) {
      var input = req.body.input;
      var newUrl = {input: input, "short-url": Math.floor(Math.random()*89999+10000)};
      Url.create(newUrl, function(err, newlyCreated) {
        if(err) {
          console.log(err);
        } else {
          res.redirect('/');
        }
      });
    });

app.route('/:shortURL')
    .get(function(req, res) {
      var url = req.params.shortURL;
      Url.find({"short-url": url}, function(err, url) {
        if(err) {
          console.log("Error:" + err);
        } else {
          res.redirect(url[0].input);
        }
      });
    });

app.route('/db/urls')
    .get(function(req, res) {
      //Get all urls from DB, render that file
      Url.find({}, function(err, allurls) {
        if(err) {
          console.log("error");
        } else {
          res.send({urls:allurls});
        }
      });
    });


// Respond not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

// Error Middleware
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }  
});

app.listen(process.env.PORT||3000, function () {
  console.log('Node.js listening ...');
});

