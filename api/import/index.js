/**
 * the full runner
 *  v0.0.1
 *
 * run like:
 *   let Importer = require('../import');
 *   return Import.run();
 */

const Location = require('./location');
const DbMysql = require('../lib/db-mysql');

module.exports = {
  run: async (limit = 0) => {
    let mysql =  await DbMysql.connect();
    let loc = new Location({limit: limit});

    await loc.run(mysql);
  }
};
