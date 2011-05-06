module.exports = {
  http: {
    // 主に socket.io 用
    host: '192.168.11.11',
    port: 8001,
    session_secret: 'minichat secret key'
  },
  mongodb: {
    // host を配列で指定した場合，replica set とみなす
    host: [
      '192.168.11.16',
      '192.168.11.17',
      '192.168.11.18'
    ],
    db: 'minichat'
  }
};

