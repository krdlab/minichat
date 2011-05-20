// -- system configration --
var conf = require('./app.conf.js');

// -- model --
var model   = require('./lib/model.js');
var db      = model.connect(conf.mongodb.host, conf.mongodb.db);
var Message = db.model('Message');

// -- express --
var express = require('express');
var crypto  = require('crypto');
var Redis   = require('connect-redis');

var redis   = new Redis();
var app     = express.createServer();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', { layout: false });
  app.use(express.logger());
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
  sio: { host: conf.http.host, port: conf.http.port }
});

app.get('/', function(req, res) {
  var username = req.session.username;
  if (username) {
    res.render('home.jade', {
      username: username
    });
  } else {
    res.redirect('/login');
  }
});

app.get('/history', function(req, res) {
  var username = req.session.username;
  if (username) {
    var num = Number(req.param('num'));
    Message.find({}).sort('created_at', -1).limit(num).exec(function(err, docs) {
      if (err)  throw err;
      var hists = [];
      docs.forEach(function(elem) {
        hists.push({ username: elem.username, message: elem.message });
      });
      res.contentType('application/json');
      res.send(hists);
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

// -- socket.io --
var relay_server = require('net').createConnection(conf.relay.port, conf.relay.host);

relay_server.setEncoding('ascii');
relay_server.on('connect', function() {

  var sio = require('socket.io').listen(app);

  var _buf = '';
  relay_server.on('data', function(chunk) {
    for (var i=0, size=chunk.length; i<size; ++i) {
      if (chunk[i] == '\0') {
        sio.broadcast(JSON.parse(_buf));
        _buf = '';
      } else {
        _buf += chunk[i];
      }
    }
  });

  var parseCookie = require('connect').utils.parseCookie;
  sio.on('connection', function(client) {
    client.on('message', function(data) {
      if (data.cookie) {
        var sid = parseCookie(data.cookie)['connect.sid'];

        redis.get(sid, function(err, session) {
          if (err) throw err;

          var username = session.username;
          var response = { username: username, message: data.message };

          new Message(response).save(function(err) {
            if (err) throw err;
            // 別ノードにリレー経由で送る
            relay_server.write(JSON.stringify(response)+'\0');
            // 同じノードのクライアントには直接送る
            client.send(response);
            client.broadcast(response);
          });

        });
      } else {
        sio.log('[warn] no cookie: ' + client);
      }
    });
  });
});
module.exports = app;
