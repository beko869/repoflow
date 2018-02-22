let Database = require('arangojs');
let config = require('./config');

let db = new Database( {url:config.databaseURL} );
db.useDatabase(config.databaseName);
db.useBasicAuth(config.databaseUser,config.databasePassword);

module.exports = db;