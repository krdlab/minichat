var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var MessageSchema = new Schema({
  username:   { type: String, required: true },
  message:    { type: String, default: '[system created]' },
  created_at: { type: Date, default: Date.now }
});

MessageSchema.static('first_or_create', function(query, defaults, callback) {
  var M = this;
  M.findOne({ username: query.username }, function(err, hit) {
    if (err) { callback(err); return; }
    if (hit) {
      callback(null, hit);
    } else {
      // create
      var m;
      if (defaults && defaults.message) {
        m = new M({ username: query.username, message: defaults.message });
      } else {
        m = new M({ username: query.username });
      }
      m.save(function(err) {
        if (err) {
          callback(err);
        } else {
          callback(null, m);
        }
      });
    }
  });
});

mongoose.model('Message', MessageSchema);

var to_mongoose_uri = function (host, db) {
  return 'mongodb://' + host + '/' + db;
};

module.exports.connect = function(host, db) {
  if (!host || !db) throw new Error('illegal argument');
  if (Array.isArray(host)) {
    var uris = [];
    host.forEach(function(elem) {
      uris.push(to_mongoose_uri(elem, db));
    });
    return mongoose.createSetConnection(uris.join(','));
  } else  {
    return mongoose.createConnection(to_mongoose_uri(host, db));
  }
};

module.exports.disconnectAll = function(cb) {
  return mongoose.disconnect(cb);
};

