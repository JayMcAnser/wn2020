/**
 * Test the code model
 */

const Db = require('./init.db').DbMongo;
const chai = require('chai');
const assert = chai.assert;
const Code = require('../model/code');

describe('model.code', () => {

  let user;
  let grpId;

  before(() => {
    return Code.deleteMany({}).then(() => {
    })
  });

  it('create', async() => {
    let c = Code.create({guid: 'CC_1', text: 'new code'});
    await c.save();
    c = await Code.findOne({guid: 'CC_1'});
    assert.isDefined(c);
    assert.equal(c.text, 'new code');
  })
});
