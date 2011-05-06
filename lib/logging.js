// 実験用の logger．logs/app.<port>.log に吐くだけ．
var fs = require('fs');

// for express
module.exports.createLogStream = function(id) {
  return fs.createWriteStream('logs/app.' + id + '.log', {
    flags:    'a',
    encoding: 'utf8'
  });
};

// for socket.io
module.exports.getSimpleLogger = function(stream) {
  return function(level, message) {
    var msg;
    if (arguments.length < 1) {
      msg = ''; // only timestamp
    } else if (arguments.length < 2) {
      msg = arguments[0];
    } else {
      msg = '[' + arguments[0] + '] ' + arguments[1];
    }
    stream.write(new Date().toUTCString() + ' ' + msg + '"\n');
  };
};

