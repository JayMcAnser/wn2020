/**
 * Test the code model
 */

const Db = require('./init.db').DbMongo;
const chai = require('chai');
const assert = chai.assert;
const Code = require('../model/code');
const History = require('../model/history');
const Session = require('../lib/session');

describe('model.code', () => {

  let session;

  before(() => {
    session = new Session({name: 'test'})
    return Code.deleteMany({}).then(() => {
      if (History) {
        return History.deleteMany({})
      }
      return true;
    })
  });

  it('create', async() => {
    let c = Code.create(session, {codeId: 1, guid: 'CC_1', text: 'new code'});
    await c.save();
    c = await Code.queryOne(session,{codeId: 1});
    assert.isDefined(c);
    assert.equal(c.text, 'new code');
  });

});
