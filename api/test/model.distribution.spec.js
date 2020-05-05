/**
 * Test the distribution model
 */

const Db = require('./init.db').DbMongo;
const chai = require('chai');
const assert = chai.assert;
const Distribution = require('../model/distribution');
const Contact = require('../model/contact');
const Art = require('../model/art');
const Session = require('../lib/session');
const Util = require('../lib/util');


describe('model.distribution', () => {

  let contact1;
  let objAddr;
  let dist;
  let art;
  let session;

  before( () => {
    return Distribution.deleteMany({}).then( async () => {
      session = new Session('distribution');
      contact1 = await Contact.findOne({addressId: 1});
      if (!contact1) {
        contact1 = Contact.create({addressId: 1, name: 'test 1'});
        await contact1.save();
        contact1 = await Contact.findOne({addressId: 1});
      }
      objAddr = contact1.objectGet();
    })
  });

  describe('crud', () => {
    it('create', async() => {
      distr = Distribution.create(session, {locationId: 1, code: '2000-0001'});
      assert.equal(contact1.name, contact1.name);
      distr.contact = contact1;
      await distr.save();

      distr = await Distribution.queryOne(session, {locationId: 1});
      assert.equal(distr.code, '2000-0001');
    });

    it('related', async () => {
      Util.QuerySession();
      distr = await Distribution.findOne({locationId: 1});
      assert.equal(distr.code, '2000-0001');
      assert.equal(distr.contact.toString(), contact1.id.toString());

      // because of the populate we can NOT use the session in the query.
      // if we want to use it anyway we have to use the session method on the record to set the values

      distr = await Distribution.findOne({locationId: 1})
        .populate('contact');
      distr.session(session);

      assert.equal(distr.contact.addressId, 1);
      assert.equal(distr.__user, session.name)
      distr.code = '2001-0002';
      await distr.save();
    });

    it('line - add', async() => {
      distr = await Distribution.findOne({locationId: 1});
      art = await Art.findOne({artId: '200'});
      if (!art) {
        art = Art.create({artId: '200', title: 'dis.art 1'});
        await art.save();
        // must do because if not stored releation won't work
        art = await Art.findOne({artId: '200'});
      }
      assert.equal(art.artId, '200');
      // add the art to the distribution
      distr.lineAdd(art);
      await distr.save();

      // read direct
      distr = await Distribution.findOne({locationId: 1});
      assert.equal(distr.line.length, 1);
      assert.equal(distr.line[0].art.toString(), art.id.toString());

      // include the artwork
      distr = await Distribution.findOne({locationId: 1})
        .populate('line.art');
      assert.equal(distr.line.length, 1);
      assert.equal(distr.line[0].art.artId, '200');
      assert.equal(distr.line.length, 1);
      assert.equal(distr.line[0].art.artId, '200', 'native field');
    });

    it('line - update', async() => {
      distr = await Distribution.findOne({locationId: 1});
      distr.lineUpdate(0, {price: '100'});
      await distr.save();
      distr = await Distribution.findOne({locationId: 1});
      assert.equal(distr.line[0].price, '100');

      // remove property
      distr.lineUpdate(0, {price: undefined});
      await distr.save();
      distr = await Distribution.findOne({locationId: 1});
      assert.isUndefined(distr.line[0].price);

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
      distr = Distribution.create(session, {locationId: 2, code: '2000-0002'});
      art1 = await Art.findOne({artId: '201'});
      if (!art1) {
        art1 = Art.create({artId: '201', title: 'dis.art 2'});
        await art1.save();
        // must do because if not stored releation won't work
        art1 = await Art.find({artId: '201'});
        art1 = art1[0]
      }
      art2 = await Art.findOne({artId: '201'});
      if (!art2) {
        art2 = Art.create({artId: '201', title: 'dis.art 2'});
        await art2.save();
        // must do because if not stored releation won't work
        art2 = await Art.find({artId: '201'});
        art2 = art2[0]
      }
    });

    it('add one line', async () => {
      distr.lineAdd({art: art1, price: 100});
      await distr.save();
      assert.equal(distr.line.length, 1);
      assert.equal(distr.line[0].price, 100);
      assert.equal(distr.subTotalCosts, 100);

      distr.lineAdd({art: art2, price: 200});
      await distr.save();
      assert.equal(distr.line.length, 2);
      assert.equal(distr.subTotalCosts, 300);

      distr.productionCosts = 400;
      await distr.save();
      assert.equal(distr.totalCosts, 700);
    });
  });

  describe('multi set', () => {
    let art1;
    let distr;

    before(async () => {
      distr = Distribution.create(session, {locationId: 3, code: '2000-0003'});
      await distr.save();
      distr = await Distribution.queryOne(session, {locationId: 3})
      art1 = await Art.findOne({artId: '201'});
      if (!art1) {
        art1 = Art.create({artId: '201', title: 'dis.art 2'});
        await art1.save();
        // must do because if not stored releation won't work
        art1 = await Art.find({artId: '201'});
        art1 = art1[0];
      }
    });
    it('set address', async () => {
      distr.contact = contact1;
      await distr.save();
      distr = await Distribution.queryOne(session, {locationId: 3});
      assert.isDefined(distr);
      assert.isDefined(distr.invoice);
      assert.isDefined(distr.contact);
    })
  })
});
