/**
 * Test the distribution model
 */

const Db = require('./init.db');
const DbMysql = Db.DbMySQL;
const DbMongo = Db.DbMongo;
const chai = require('chai');
const assert = chai.assert;
const ImportLocation = require('../import/location');
const Distribution = require('../model/distribution');
const Address = require('../model/address');
const Setup = require('../lib/setup');

describe('import.location', () => {

  let mySQL;
  before( () => {
    return Distribution.deleteMany({}).then( () => {
      return Address.deleteMany({}).then( () => {
        return DbMysql.connect().then((con) => {
          mySQL = con;
          let setup = new Setup()
          return setup.run();
        })
      })
    })
  });

  it('run - clean', () => {
    const limit = 100;
    let imp = new ImportLocation({ limit: limit});
    assert.isTrue(true);
    return imp.run(mySQL).then( (result) => {
      assert.equal(result.count, limit)
    })
  })
});
