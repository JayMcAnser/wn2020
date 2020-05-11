/**
 * Test the Contact model
 */

const Db = require('./init.db').DbMongo;
const chai = require('chai');
const assert = chai.assert;
const Contact = require('../model/contact');
const Setup = require('../lib/setup');
const Session = require('../lib/session');


describe('model.contact', () => {
  let session;

  before( () => {
    return Contact.deleteMany({}).then(() => {
      session = new Session(('contact'))
      let setup = new Setup();
      return setup.run();
    });
  });

  describe('base', () => {
    let cnt;
    let workId;

    before( async () => {
      cnt = await Contact.create(session, {addressId: 1, name: 'test 1'});
      return cnt.save();
    });

    it('add address', async() => {
      cnt.locationAdd({usage: 'work', street: 'Weststreet',number: '1', zipcode: '1017TE', city: 'Amsterdam'})
      cnt = await cnt.save();
      cnt = await Contact.queryOne(session,{addressId : 1});
      assert.equal(cnt.location.length, 1);
      assert.equal(cnt.location[0].usage, 'work');
      assert.equal(cnt.location[0].zipcode,  '1017TE');
      workId = cnt.location[0].id;
      assert.isDefined(workId)
    });

    it('update an address', async() => {
      cnt.locationUpdate(workId, {usage: 'work', street: 'Weststreet',number: '1', zipcode: '1089TE', city: 'Amsterdam'})
      cnt = await cnt.save();
      cnt = await Contact.queryOne(session,{addressId : 1});
      assert.equal(cnt.location.length, 1);
      assert.equal(cnt.location[0].zipcode,  '1089TE');
    });

    it('delete', async() => {
     cnt.locationUpdate(workId);
      cnt = await cnt.save();
      cnt = await Contact.queryOne(session,{addressId : 1});
      assert.equal(cnt.location.length, 0);
    })
  })
  // describe('crud', () => {
  //   it('create', () => {
  //     return Address.link(3).then((addr) => {
  //       assert.isDefined(addr.addressId);
  //       assert.equal(addr.addressId, 3);
  //     });
  //   });
  // });
});
