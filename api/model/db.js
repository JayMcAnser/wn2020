/**
 * The global db object
 * version 0.0.1
 *
 * So we can say
 * const Db = require('./model/db;
 *
 * db.tables.newsletter.add({user: 'Jay', email: 'jay@mcanser'})
 */
const Store = require('./store');
const Table = require('./table');
const Newsletter = require('./newsletter');

class Db extends Store {
  constructor () {
    super();
    this.initTables();
  }

  initTables() {
//     class newsletter extends Table {}
    class user extends Table {}

    let tbl = new Newsletter(this);
    tbl = new user(this);
  }
}

module.exports = Db
module.exports.db = new Db();
