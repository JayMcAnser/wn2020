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

describe('model.agent', () => {

  let agent;
  let contact;
  let contact2;
  let agentObj;

  before(() => {
    return Agent.deleteMany({}).then(() => {
        let setup = new Setup();
        return setup.run();
    });
  });

  it('create', async () => {
    agent = await Agent.findOne({agentId: '1'});
    if (!agent) {
      agent = Agent.create({agentId: '1', name: 'agent 1'});
      await agent.save();
      agent = await Agent.findOne({agentId: '1'});
    }
    assert.equal(agent.agentId, 1);
    agentObj = agent.objectGet();
    assert.equal(agentObj.name, 'agent 1');
  });

  it('contact', async() => {
    contact = Contact.create({addessId: 1, name: 'contact 1'});
    await contact.save();
    agent.objectSet({contact: contact});
    await agent.save();
    agent = await Agent.findOne({agentId: 1})
      .populate('_fields.related');

    let obj = agent.objectGet();
    assert.isDefined(obj.contact);
    assert.equal(obj.contact.name, 'contact 1');
    assert.equal(obj.contactRights.name, 'contact 1');

    // split the contact values
    contact2 = Contact.create({addessId: 2, name: 'contact 2'});
    await contact2.save();
    agent.objectSet({contactRights: contact2});
    await agent.save();
    agent = await Agent.findOne({agentId: 1})
      .populate('_fields.related');

    obj = agent.objectGet();
    assert.equal(obj.contact.name, 'contact 1');
    assert.equal(obj.contactRights.name, 'contact 2');

    // do an unsplit
    agent.objectSet({contactRights: undefined});
    await agent.save();
    agent = await Agent.findOne({agentId: 1})
      .populate('_fields.related');

    obj = agent.objectGet();
    assert.equal(obj.contact.name, 'contact 1');
    assert.equal(obj.contactRights.name, 'contact 1');

  })
});
