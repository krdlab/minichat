// -- system configration --
var conf = require('./app.conf.js');
// $ node app.js [port] [host]
var backend_port = process.argv[2] || conf.http.port;
var backend_host = process.argv[3] || conf.http.host;

// -- logging --
var log = require('./lib/logging.js');
var log_stream = log.createLogStream(backend_port);
var log_func   = log.getSimpleLogger(log_stream);

// -- model --
var model = require('./lib/model.js');
var db    = model.connect(conf.mongodb.host, conf.mongodb.db);

var Message = db.model('Message');

// -- express --
var express = require('express');
var crypto  = require('crypto');
var Redis   = require('connect-redis');
var app     = express.createServer();

var redis = new Redis();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', { layout: false });
  app.use(express.logger({ stream: log_stream }));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
    //secret: crypto.createHash('sha1').update(''+Math.random()).digest('hex'),
    secret: conf.http.session_secret,
    cookie: { httpOnly: false , maxAge: 1800*1000 }, // 30mins
    store:  redis
  }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.helpers({ // static view helpers
  sio: { host: backend_host, port: backend_port }
});

app.get('/', function(req, res) {
  var username = req.session.username;
  if (username) {
    var num_hist = 10;
    Message.find({}).sort('created_at', -1).limit(num_hist).exec(function(err, docs) {
      if (err)  throw err;
      var hist = [];
      for (var i=0, size=docs.length; i<size; ++i) {
        var doc = docs[i].doc;
        hist.push({
          username: doc.username,
          message:  doc.message
        });
      }
      res.render('home.jade', {
        username: username,
        hist:     hist
      });
    });
  } else {
    res.redirect('/login');
  }
});

app.get('/login', function(req, res) {
  res.render('login.jade');
});

app.post('/login', function(req, res) {
  var username = req.param('username');
  Message.first_or_create({ username: username },       // query
                          { message: '[新規ユーザ]' },  // defaults
                          function(err, hit) {          // callback
    if (err) throw err;
    req.session.regenerate(function() {
      req.session.username = username;
      res.redirect('/');
    });
  });
});

// XXX 本当は必要
//app.on('close', function() {
//  model.disconnectAll(function() {
//    log_stream.destroySoon();
//    // socket.io が残ってるのかな？終わらない．．．
//  });
//});
//process.on('SIGINT', function() {
//  app.close();
//});

// -- start --
app.listen(backend_port);
console.log("minichat server listening on port %d", app.address().port);

// -- socket.io --
var parseCookie = require('connect').utils.parseCookie;

var socket = require('socket.io').listen(app, { log: log_func });
socket.on('connection', function(client) {
  client.on('message', function(data) {
    if (data.cookie) {
      var sid = parseCookie(data.cookie)['connect.sid'];
      redis.get(sid, function(err, session) {
        if (err) throw err;
        var username = session.username;
        var response = { username: username, message: data.message };
        new Message(response).save(function(err) {
          if (err) throw err;
          client.send(response);
          client.broadcast(response);
        });
      });
    } else {
      socket.log('[warn] no cookie: ' + client);
    }
  });
});

