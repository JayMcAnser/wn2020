/**
 * Test the user model
 */

const Db = require('./init.db').DbMongo;
const chai = require('chai');
const assert = chai.assert;
const Art = require('../model/art');
const Setup = require('../lib/setup');

describe('model.art', () => {

  let art;
  let artObj;

  before( () => {
    return Art.deleteMany({}).then(() => {
      let setup = new Setup();
      return setup.run();
    });
  });

  it('create', async () => {
    art = await Art.findOne({art: '1'});
    if (!art) {
      art = Art.create({artId: '1', title: 'art.test 1'});
      await art.save();
      art = await Art.findOne({artId: '1'});
    }
    assert.equal(art.artId, 1);
    artObj = art.objectGet();
    assert.equal(artObj.title, 'art.test 1');
  })
});
