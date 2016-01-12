var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'calDay'
    },
    port: process.env.PORT || 3000,
    secret : "calDaySami",
    db: 'mongodb://sami:sami@ds039115.mongolab.com:39115/caldaydatabase'
  },

  test: {
    root: rootPath,
    app: {
      name: 'calDay'
    },
    port: process.env.PORT || 3000,
    secret : "calDaySami",
    db: 'mongodb://sami:sami@ds039115.mongolab.com:39115/caldaydatabase'
  },

  production: {
    root: rootPath,
    app: {
      name: 'calDay'
    },
    port: process.env.PORT || 3000,
    secret : "calDaySami",
    db: 'mongodb://sami:sami@ds039115.mongolab.com:39115/caldaydatabase'
  }
};

module.exports = config[env];
