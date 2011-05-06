minichat
========

## What is it?
動作確認用に作成したテスト Web アプリです．
よくあるしょぼいチャット．

## Install
-redis>=1.3.15
-mongoDB>=1.8.1
-node.js>=0.4.7
-npm
-npm packages:
--express@2.2.2
--jade@0.10.6
--connect-redis@1.0.3
--redis@0.6.0
--mongoose@1.3.0
--socket.io@0.6.17

# Configuration
app.conf.js を参照．

# Run
複数起動する場合は，引数にポート番号 (必要ならホスト) を指定してください．

  $ node app.js 8001 [host]

logs/ 以下に app.ポート番号.log というログファイルが作成されます．

## More information
http://d.hatena.ne.jp/KrdLab/

