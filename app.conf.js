module.exports = {
  http: {
    host: '192.168.11.13',
    port: 8001,
    session_secret: 'minichat secret key'
  },
  relay: {
    host: '192.168.11.13',
    port: 3000
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

