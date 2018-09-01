const path = require('path');

let config = {};

config.databaseHost             = '127.0.0.1';
config.databasePort             = '8529';
config.databaseName             = 'repoflow';
config.databaseUser             = 'root';
config.databasePassword         = 'Nenya123';
config.databaseURL              = 'http://'+config.databaseUser+':'+config.databasePassword+'@'+config.databaseHost+':'+config.databasePort;
config.repoURL                  = '';
config.repoDirectory            = path.resolve( __dirname, '../.git' );

module.exports = config;