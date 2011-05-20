var net = require('net');

var chunk_buf = {};
var clients  = [];

var server = net.createServer(function(socket) {
  clients.push(socket);

  socket.setEncoding('ascii');

  socket.on('data', function(chunk) {
    var id = socket.fd;

    chunk_buf[id] = chunk_buf[id] || '';

    for (var i=0, size=chunk.length; i<size; ++i) {
      if (chunk[i] == '\0') {   // XXX separator 大丈夫か？
        var data = chunk_buf[id];
        chunk_buf[id] = '';

        clients.forEach(function(client) {
          // 自分以外の相手に送る
          if (client != socket) {
            client.write(data+'\0');
          }
        });
      } else {
        chunk_buf[id] += chunk[i];
      }
    }
  });

  socket.on('close', function() {
    var i = clients.indexOf(socket);
    delete clients[i];
  });

});

server.listen(Number(process.argv[2] || 3000));
