var conf    = require('./app.conf.js');
var model   = require('./lib/model.js');
var cluster = require('cluster');
cluster('app')
  .on('close', function() { model.disconnectAll(); })
  .use(cluster.debug())
  .use(cluster.logger())
  .use(cluster.pidfiles())
  .listen(conf.http.port);

