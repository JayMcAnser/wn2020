/**
 * Test the Contact model
 */

const Db = require('./init.db').DbMongo;
const chai = require('chai');
const assert = chai.assert;
const Contact = require('../model/contact');
const Setup = require('../lib/setup');

describe('model.address', () => {
  before( () => {
    return Contact.deleteMany({}).then(() => {
      let setup = new Setup();
      return setup.run();
    });
  });

  // describe('crud', () => {
  //   it('create', () => {
  //     return Address.link(3).then((addr) => {
  //       assert.isDefined(addr.addressId);
  //       assert.equal(addr.addressId, 3);
  //     });
  //   });
  // });
});
