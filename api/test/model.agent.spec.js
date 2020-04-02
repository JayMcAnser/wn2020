/**
 * Test the Art model
 */

const Db = require('./init.db').DbMongo;
const chai = require('chai');
const assert = chai.assert;
const Agent = require('../model/agent');
const Code = require('../model/code');
const Setup = require('../lib/setup');

describe('model.agent', () => {

  let agent;
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
});
