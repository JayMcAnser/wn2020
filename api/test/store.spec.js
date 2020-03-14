/**
 * Testing the general data store
 * version 2020-02-08
 */
const x = require('./init');
const chai = require('chai');
const assert = chai.assert;
const Store = require('../model/store');
const fs = require('fs');

describe('model.store', async () => {

  const TEST_NAME = 'testfile';
  const TEST_NAME_EXIST = 'testfile.remain';
  const ROOT_DIR = '/storeData';

  describe('register', () => {
    it('create', () => {
      let data = new Store();
      assert.isDefined(data, 'did create');
      assert.isDefined(data.dataDir, 'has a dataDir');
      assert.equal(data.dataDir, __dirname + ROOT_DIR, 'location of store info');
    });

    it('create - new', async () => {
      let filename = __dirname + ROOT_DIR + '/' + TEST_NAME
      if (fs.existsSync(filename)) {
        fs.unlinkSync(filename);
      }
      let data = new Store();
      let s = data.register(TEST_NAME);
      assert.equal(data.tableNames.length, 1, 'one registered');
      assert.equal(data.tableNames[0], TEST_NAME, 'with the name');
      assert.equal(Object.keys(data.store(TEST_NAME)).length, 0, 'no elements');
    });

    it('open existing', async() => {
      let data = new Store();
      let s = data.register(TEST_NAME_EXIST);
      assert.equal(data.tableNames.length, 1, 'one registered');
      assert.equal(data.tableNames[0], TEST_NAME_EXIST, 'with the name');
      assert.equal(Object.keys(data.store(TEST_NAME_EXIST)).length, 1, 'one element');
      let rec = await data.get(TEST_NAME_EXIST, '123');
      assert.isDefined(rec, 'can get by id' );
      assert.equal(rec._id, '123', 'found the id');
      rec = await data.get(TEST_NAME_EXIST, 'not found');
      assert.isFalse(rec, 'no rec found')
    })
  });

  // ---------
  // The table internals: Get, Update, Delete, Find are tested with the Table definition
})
