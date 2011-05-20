minichat
========

## What is it?
動作確認用に作成したテスト Web アプリです．
よくあるしょぼいチャットが，cluster で負荷分散しています．

## Install
- redis>=1.3.15
- mongoDB>=1.8.1
- node.js>=0.4.7
- npm
- npm packages:
    - cluster@0.6.1
    - express@2.2.2
    - jade@0.10.6
    - connect-redis@1.0.3
    - redis@0.6.0
    - mongoose@1.3.0
    - socket.io@0.6.17

# Configuration
app.conf.js を参照してください．
プライベート IP の部分を自身の環境に合わせて設定すれば動きます．
デフォルトでは以下のポート構成になっています．
- relay_server: 3000
- cluster: 8001
- redis: default port (6379)
- mongoDB: default port (27017)

# Run
まず Socket.io を中継する relay server を起動します．
    $ node relay_server.js

次に cluster を起動します．
    $ node cluster.js

フロントサーバ (reverse proxy) にアクセスします．

## More information
http://d.hatena.ne.jp/KrdLab/

