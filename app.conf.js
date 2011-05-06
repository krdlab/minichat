module.exports = {
  http: {
    // 主に socket.io 用
    host: '***.***.***.***',
    port: 8001,
    session_secret: 'minichat secret key'
  },
  mongodb: {
    // host を配列で指定した場合，replica set とみなす
    host: [
      '***.***.***.***',
      '***.***.***.***',
      '***.***.***.***'
    ],
    db: 'minichat'
  }
};

