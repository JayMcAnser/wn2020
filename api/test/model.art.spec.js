/**
 * Test the user model
 */

const Db = require('./init.db').DbMongo;
const chai = require('chai');
const assert = chai.assert;
const Art = require('../model/art');
const Setup = require('../lib/setup');

describe('model.art', () => {

  before( () => {
    return Art.deleteMany({}).then(() => {
      let setup = new Setup();
      return setup.run();
    });
  });

  it('create', () => {
  })
});
