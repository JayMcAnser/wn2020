/**
 * Testing the general table
 * version 2020-02-08
 */
const x = require('./init');
const chai = require('chai');
const assert = chai.assert;
const Store = require('../model/store');
const Table = require('../model/table');


describe('table', () => {
  class CrudTable extends Table {}

  describe('create',  () => {
    let store = new Store();
    it('did create', () => {
      let tbl = new Table({store: store, name: 'tbl.test'});
      assert.isDefined(tbl, 'has store');
      assert.equal(store.count, 1, 'has one store');
      assert.equal(store.tableNames[0], 'tbl.test', 'has the name');
    });

    it('fail if no store', () => {
      assert.throws(() => {new Table({name: 'tbl.test'}) }, Error, 'store is missing');
    })

    it('auto name', () =>  {
      class TestTable extends Table {
      }
      let tbl = new TestTable(store);
      assert.equal(tbl.name, 'TestTable', 'has a name')
    })
  });

  describe('crud', () => {

    let store = new Store();
    let tbl = new CrudTable(store);
    // remove the previous test
    store.drop(tbl.name);
    tbl = new CrudTable(store);
    let rec = { name: 'testing'};
    let id;

    it('add', async () =>{
      let recStore = await tbl.add(rec);
      assert.isDefined(recStore._id, 'has an id');
      id = recStore._id;
      let recStore2 = await tbl.add({name: 'testing2'});
      assert.isDefined(recStore2._id, 'has an id');
      assert.equal(tbl.recordCount(), 2, 'has 2 records')
    });

    it ('get', async() => {
      let recStore = await tbl.get(id);
      assert.equal(recStore.name, 'testing', 'found the name');
    });

    it('update', async() => {
      let recStore = await tbl.get(id);
      recStore.name = 'new value';
      await tbl.update(id, recStore);
      let r = await tbl.get(id);
      assert.equal(r.name, 'new value', 'did store the change');
      // reopen a store
      let store2 = new Store();
      let tbl2 = new CrudTable(store2);
      let r2 = await tbl2.get(id);
      assert.equal(r2.name, 'new value', 'did store / reload the change');
    })

    it('delete', async () => {
      let r = await tbl.get(id);
      assert.equal(rec._id, id, 'found it');
      await tbl.delete(id);
      r = await tbl.get(id);
      assert.isFalse(r, 'not found any more')
    })
  });

  describe('find', () => {
    let store = new Store();
    let tbl = new CrudTable(store);

    it('one record', async () => {
      let recStore = await tbl.add({name: 'some name'});
      let recs = await tbl.find({name: 'some name'});
      assert.isDefined(recs, 'found something')
      assert.equal(recs.length, 1, 'has one record')
      assert.equal(recs[0]._id, recStore._id, 'the right one')
    });

    it('filter one record', async() => {
      let recStore = await tbl.add({name: 'some other name'});
      let recs = await tbl.find({name: 'some name'});
      assert.isDefined(recs, 'found something')
      assert.equal(recs.length, 1, 'just one record')
    })
    it('filter two record', async() => {
      let recStore = await tbl.add({name: 'some name'});
      let recs = await tbl.find({name: 'some name'});
      assert.isDefined(recs, 'found something')
      assert.equal(recs.length, 2,  'just both record')
    })
  })
});
