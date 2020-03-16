/**
 * Test the mongo interface
 */
const init = require('./init');
const chai = require('chai');
const assert = chai.assert;
const DbMongo = require('../lib/db-mongo');

describe('db-mongo', async () => {

  it('open', () => {
    let dbMongo = new DbMongo();
    return dbMongo.connect().then( (connection) => {
      assert.isDefined(connection);
      assert.equal(connection.connections.length, 1);
      let con = DbMongo.con;
      console.log(con);
    })
  })
});
