/**
 * Test the user model
 */

const Db = require('./init.db').DbMongo;
const chai = require('chai');
const assert = chai.assert;
const Art = require('../model/art');
const Code = require('../model/code');
const Setup = require('../lib/setup');

describe('model.art', () => {

  let art;
  let artObj;

  before( () => {
    return Art.deleteMany({}).then(() => {
      return Code.deleteMany({}).then(() => {
        let setup = new Setup();
        return setup.run();
      });
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
  });

  it('load codes', async () => {
    let code1 = Code.create({codeId: 12, text: 'code 12'});
    code1 = await code1.save();
    let art2 = Art.create({artId: 12, title: 'art 12', codes: [code1]});
    art2 = await art2.save();
    art2 = await Art.findOne({artId: 12})
      .populate('codes')
    ;
    let obj = art2.objectGet();
    assert.isDefined(obj.codes);
    assert.equal(obj.codes.length, 1);
    assert.equal(obj.codes[0].text, 'code 12')
  })
});
