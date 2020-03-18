/**
 * Test the mongo interface
 */
const init = require('./init');
const chai = require('chai');
const assert = chai.assert;
const DbMySql = require('../lib/db-mysql');

describe('db-mysql', async () => {
  it('create connection', () => {
    let sql = new DbMySql();
    return sql.connect().then( () => {
      assert.isTrue(true, 'did open')
    })
  });

  it('run query', () => {
    let sql = new DbMySql();
    return sql.connect().then( () => {
      return sql.query('SELECT * FROM art LIMIT 0, 1').then( (recs) => {
        assert.equal(recs.length, 1);
        assert.equal(recs[0].art_ID, 3);
      })
    })
  });

  it('run stream', () => {
    let sql = new DbMySql();
    return sql.connect().then( (con) => {
      let art = con.queryStream('SELECT * FROM art LIMIT 0, 10');
      art.on('result', a => {
        assert.isDefined(a.art_ID);
   //     console.log(a.art_ID)
      });
      art.on('end', () => {
        con.end;
      })
    });
  })
});
