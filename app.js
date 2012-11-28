var express = require('express')
  , routes = require('./routes')
  , fs = require('fs');

var app = express();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', { pretty: true });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(express.favicon(__dirname+'/public/images/favicon.ico'));
  app.use(app.router);
});

var port = process.env.PORT || 3000;

app.listen(port, function(){
  console.log("Express server listening");
});
