/**
 * Test the distribution model
 */

const Db = require('./init.db').DbMongo;
const chai = require('chai');
const assert = chai.assert;
const Distribution = require('../model/distribution');
const Address = require('../model/address');
const Art = require('../model/art');


describe('model.distribution', () => {

  let addr1;
  let objAddr;
  let dist;
  let art;

  before( () => {
    return Distribution.deleteMany({}).then( async () => {
      addr1 = await Address.findOne({addressId: 1});
      if (!addr1) {
        addr1 = Address.create({addressId: 1, name: 'test 1'});
        await addr1.save();
        addr1 = await Address.findOne({addressId: 1});
      }
      objAddr = addr1.objectGet();
    })
  });

  describe('crud', () => {
    it('create', async() => {
      distr = Distribution.create({locationId: 1, code: '2000-0001'});
      assert.equal(addr1.name, addr1.name);
      distr.objectSet({contact: addr1});
      await distr.save();

      distr = await Distribution.findOne({locationId: 1});
      let obj = distr.objectGet();
      assert.equal(obj.code, '2000-0001');
    });

    it('related', async () => {
      distr = await Distribution.findOne({locationId: 1});
      obj = distr.objectGet();
      assert.equal(obj.code, '2000-0001');
      assert.equal(obj.contact.toString(), addr1.id.toString());

      distr = await Distribution.findOne({locationId: 1})
        .populate('_fields.related');
      obj = distr.objectGet();
      assert.equal(obj.contact.name, objAddr.name);
    });

    it('line - add', async() => {
      distr = await Distribution.findOne({locationId: 1});
      art = await Art.findOne({artId: '200'});
      if (!art) {
        art = Art.create({artId: '200', title: 'dis.art 1'});
        await art.save();
        // must do because if not stored releation won't work
        art = await Art.find({artId: '200'});
      }
      assert.equal(art.artId, '200');
      // add the art to the distribution
      distr.lineAdd(art);
      await distr.save();

      // read direct
      distr = await Distribution.findOne({locationId: 1});
      assert.equal(distr.line.length, 1);
      assert.equal(distr.line[0].art.toString(), art.id.toString());
      let obj = distr.objectGet();
      assert.equal(obj.line.length, 1);

      // include the artwork
      distr = await Distribution.findOne({locationId: 1})
        .populate('line.art');
      assert.equal(distr.line.length, 1);
      assert.equal(distr.line[0].art.artId, '200');
      obj = distr.objectGet();
      assert.equal(obj.line.length, 1);
      assert.equal(obj.line[0].art.artId, '200', 'native field');
      assert.equal(obj.line[0].art.title, 'dis.art 1', 'flex field');
    });

    it('line - update', async() => {
      distr = await Distribution.findOne({locationId: 1});
      distr.lineUpdate(0, {price: '100'});
      await distr.save();
      distr = await Distribution.findOne({locationId: 1});
      let obj = distr.objectGet();
      assert.equal(obj.line[0].price, '100');

      // remove property
      distr.lineUpdate(0, {price: undefined});
      await distr.save();
      distr = await Distribution.findOne({locationId: 1});
      obj = distr.objectGet();
      assert.isUndefined(obj.line[0].price);

      assert.throws( () => { distr.lineUpdate(99, {price: undefined}); }, 'not found')
    });

    it('line - remove', async() => {
      distr = await Distribution.findOne({locationId: 1});
      assert.equal(distr.lineCount(), 1);
      distr.lineRemove(0);
      await distr.save();
      distr = await Distribution.findOne({locationId: 1});
      assert.equal(distr.lineCount(), 0)
    })
  });

  describe('calculations', () => {
    let art1;
    let art2;
    let distr;

    before(async () => {
      distr = Distribution.create({locationId: 2, code: '2000-0002'});
      art1 = await Art.findOne({artId: '201'});
      if (!art1) {
        art1 = Art.create({artId: '201', title: 'dis.art 2'});
        await art1.save();
        // must do because if not stored releation won't work
        art1 = await Art.find({artId: '201'});
      }
      art2 = await Art.findOne({artId: '201'});
      if (!art2) {
        art2 = Art.create({artId: '201', title: 'dis.art 2'});
        await art2.save();
        // must do because if not stored releation won't work
        art2 = await Art.find({artId: '201'});
      }
    });

    it('add one line', async () => {
      distr.lineAdd({art: art1, price: 100});
      await distr.save();
      let obj = distr.objectGet();
      assert.equal(obj.line.length, 1);
      assert.equal(obj.line[0].price, 100);
      assert.equal(obj.subTotalCosts, 100);

      distr.lineAdd({art: art2, price: 200});
      await distr.save();
      obj = distr.objectGet();
      assert.equal(obj.line.length, 2);
      assert.equal(obj.subTotalCosts, 300);

      distr.objectSet({productionCosts: 400});
      await distr.save();
      obj = distr.objectGet();
      assert.equal(obj.totalCosts, 700);
    });
  });

  describe('multi set', () => {
    let art1;
    let distr;

    before(async () => {
      distr = Distribution.create({locationId: 3, code: '2000-0003'});
      await distr.save();
      distr = await Distribution.findOne({locationId: 3})
      art1 = await Art.findOne({artId: '201'});
      if (!art1) {
        art1 = Art.create({artId: '201', title: 'dis.art 2'});
        await art1.save();
        // must do because if not stored releation won't work
        art1 = await Art.find({artId: '201'});
      }
    });
    it('set address', async () => {
      distr.objectSet({contact: addr1});
      await distr.save();
      distr = await Distribution.findOne({locationId: 3});
      obj = distr.objectGet();
      assert.isDefined(obj.invoice);
      assert.isDefined(obj.contact);
    })
  })
});
