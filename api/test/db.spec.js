/**
 * Testing the database
 * version 2020-02-08
 */
const x = require('./init');
const chai = require('chai');
const assert = chai.assert;
const db = require('../model/db').db;

describe('model.db', async () => {


  describe('newsletter', () => {

    it('use', async () => {
      // clean the newsletters
      await db.drop('newsletter');
      db.initTables();

      let nws = db.tables.Newsletter;
      let rec = await nws.add({name: 'jay'});
      assert.isDefined(rec.data._id, 'has id');
      await nws.update(rec.data._id, {name: 'Jay McAnser'});
      let r = await nws.get(rec.data._id);
      assert.equal(r.data.name, 'Jay McAnser');
    });
  })
})
