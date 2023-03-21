const host = process.env.ENV ? '127.0.0.1' : 'mongodb'
module.exports = {
  DB: 'mongodb://' + host + ':27017/athena'
};