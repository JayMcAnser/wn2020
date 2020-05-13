/**
 * Test the Agent model
 */

const Db = require('./init.db').DbMongo;
const chai = require('chai');
const assert = chai.assert;
const Agent = require('../model/agent');
const Contact = require('../model/contact');
const Code = require('../model/code');
const Setup = require('../lib/setup');
const Session = require('../lib/session');

describe('model.agent', () => {

  let agent;
  let contact;
  let contact2;
  let agentObj;
  let session;

  before(() => {
    return Agent.deleteMany({}).then(() => {
      return Contact.deleteMany({}).then( ()  => {
        return Code.deleteMany({}).then( () => {
          let setup = new Setup();
          session = new Session('agent test');
          return setup.run();
        })
      })
    });
  });

  it('create', async () => {
    agent = await Agent.queryOne(session, {agentId: '1'});
    if (!agent) {
      agent = Agent.create(session, {agentId: '1', name: 'agent 1'});
      await agent.save();
      agent = await Agent.queryOne(session, {agentId: '1'});
    }
    assert.equal(agent.agentId, 1);
    assert.equal(agent.name, 'agent 1');
  });

  it('contact', async() => {
    contact = Contact.create(session, {addessId: 1, name: 'contact 1'});
    await contact.save();
    agent.contactAdd(contact);
    await agent.save();
    agent = await Agent.findOne({agentId: 1})
      .populate('contacts.contact');

    assert.isDefined(agent.contact);
    assert.equal(agent.contact.name, 'contact 1');
    assert.equal(agent.contactRights.name, 'contact 1');

    // split the contact values
    contact2 = Contact.create(session, {addessId: 2, name: 'contact 2'});
    await contact2.save();
    agent.contactAdd(contact2, 'rights');
    await agent.save();
    agent = await Agent.findOne({agentId: 1})
      .populate('contacts.contact');
    assert.equal(agent.contact.name, 'contact 1');
    assert.equal(agent.contactRights.name, 'contact 2');

    // do an unsplit
    agent.contactRemove(1);
    await agent.save();
    agent = await Agent.findOne({agentId: 1})
      .populate('contacts.contact');
    assert.equal(agent.contact.name, 'contact 1');
    assert.equal(agent.contactRights.name, 'contact 1');

  });

  it('code', async() => {
    let code1 = Code.create(session, {text: 'code1'});
    await code1.save();
    code1 = await Code.queryOne(session, { text: 'code1'});
    assert.isDefined(code1.text);
    let code2 = Code.create(session, {text: 'code2'});
    await code2.save();
    code2 = await Code.queryOne(session, { text: 'code2'});
    assert.isDefined(code2.text);

    agent.codeAdd(code1);
    await agent.save();
    agent = await Agent.queryOne(session, {agentId: '1'});
    assert.equal(agent.codes.length, 1);

    agent.codeAdd(code2);
    await agent.save();
    agent = await Agent.queryOne(session, {agentId: '1'});
    assert.equal(agent.codes.length, 2);

    agent.codeAdd(code2);
    await agent.save();
    agent = await Agent.queryOne(session, {agentId: '1'});
    assert.equal(agent.codes.length, 2, 'add must be unique');

    agent.codeRemove(code2);
    await agent.save();
    agent = await Agent.queryOne(session, {agentId: '1'});
    assert.equal(agent.codes.length, 1, 'removed by code id');


    agent.codeSet([code1, code2]);
    await agent.save();
    agent = await Agent.queryOne(session, {agentId: '1'});
    assert.equal(agent.codes.length, 2);

    agent.codeSet([code1, code1]);
    await agent.save();
    agent = await Agent.queryOne(session, {agentId: '1'});
    assert.equal(agent.codes.length, 1);

    agent.codeSet([code2]);
    await agent.save();
    agent = await Agent.queryOne(session, {agentId: '1'});
    assert.equal(agent.codes.length, 1);
    assert.equal(agent.codes[0]._id.toString(), code2._id, toString());
  })
});
