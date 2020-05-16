
process.env["NODE_CONFIG_DIR"] = __dirname + '/../config/';
process.env.NODE_ENV = 'command';
const Config = require('config');
const DbMongo = require('../lib/db-mongo');
const DbMySQL = require('../lib/db-mysql');

async function initDb() {
  await DbMongo.connect();
  await DbMySQL.connect();
}
initDb();

module.exports.DbMongo = DbMongo;
module.exports.DbMySQL = DbMySQL;

