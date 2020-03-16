/**
 * init the Mongo driver
 */
const init = require('./init');
const DbMongo = require('../lib/db-mongo');

async function initDb() {
  return await DbMongo.connect()
}
initDb();
module.exports = DbMongo
