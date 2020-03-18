/**
 * init the Mongo driver
 */
const init = require('./init');
const DbMongo = require('../lib/db-mongo');
const DbMySQL = require('../lib/db-mysql');

async function initDb() {
  await DbMongo.connect();
  await DbMySQL.connect();
}
initDb();

module.exports.DbMongo = DbMongo;
module.exports.DbMySQL = DbMySQL;
