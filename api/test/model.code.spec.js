/**
 * Test the code model
 */

const Db = require('./init.db').DbMongo;
const chai = require('chai');
const assert = chai.assert;
const Code = require('../model/code');

describe('model.code', () => {

  before(() => {
    return Code.deleteMany({}).then(() => {
    })
  });

  it('create', async() => {
    let c = Code.create({codeId: 1, guid: 'CC_1', text: 'new code'});
    await c.save();
    c = await Code.findOne({codeId: 1});
    let obj = c.objectGet();
    assert.isDefined(obj);
    assert.equal(obj.text, 'new code');
  });

});
