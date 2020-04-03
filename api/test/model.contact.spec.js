/**
 * Test the Contact model
 */

const Db = require('./init.db').DbMongo;
const chai = require('chai');
const assert = chai.assert;
const Contact = require('../model/contact');
const Setup = require('../lib/setup');

describe('model.contact', () => {
  before( () => {
    return Contact.deleteMany({}).then(() => {
      let setup = new Setup();
      return setup.run();
    });
  });

  describe('base', () => {
    let cnt;
    let workId;

    before( () => {
      cnt = Contact.create({addressId: 1, name: 'test 1'});
    });

    it('add address', async() => {
      cnt.addressAdd({usage: 'work', street: 'Weststreet',number: '1', zipcode: '1017TE', city: 'Amsterdam'})
      cnt = await cnt.save();
      cnt = await Contact.findOne({addressId : 1});
      let obj = cnt.objectGet();
      assert.equal(obj.addresses.length, 1);
      assert.equal(obj.addresses[0].usage, 'work');
      assert.equal(obj.addresses[0].zipcode,  '1017TE');
      workId = obj.addresses[0].id;
      assert.isDefined(workId)
    });

    it('update an address', async() => {
      cnt.addressUpdate(workId, {usage: 'work', street: 'Weststreet',number: '1', zipcode: '1089TE', city: 'Amsterdam'})
      cnt = await cnt.save();
      cnt = await Contact.findOne({addressId : 1});
      let obj = cnt.objectGet();
      assert.equal(obj.addresses.length, 1);
      assert.equal(obj.addresses[0].zipcode,  '1089TE');
    });

    it('delete', async() => {
     cnt.addressUpdate(workId);
      cnt = await cnt.save();
      cnt = await Contact.findOne({addressId : 1});
      let obj = cnt.objectGet();
      assert.isUndefined(obj.addresses);
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
