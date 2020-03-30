/**
 * Test the group model
 */

const Db = require('./init.db').DbMongo;
const chai = require('chai');
const assert = chai.assert;
const Address = require('../model/address');
const Setup = require('../lib/setup');

describe('model.address', () => {
  before( () => {
    return Address.deleteMany({}).then(() => {
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
