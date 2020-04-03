/**
 * Test the Art model
 */

const Db = require('./init.db').DbMongo;
const chai = require('chai');
const assert = chai.assert;
const Art = require('../model/art');
const Code = require('../model/code');
const Agent = require('../model/agent');
const Setup = require('../lib/setup');

describe('model.art', () => {

  let art;
  let artObj;

  before( () => {
    return Art.deleteMany({}).then(() => {
      return Code.deleteMany({}).then(() => {
          return Agent.deleteMany( {} ).then( () => {
          let setup = new Setup();
          return setup.run();
        });
      })
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
  });

  describe('agents', () => {
    let art3;
    let agent2;
    let agent1;

    before(async() => {
      art3 = Art.create({artId: 30, title: 'art 30'});
      art3 = await art3.save();
      art3 = await Art.findOne({artId: 30})
    });

    it('add one artist', async () => {
      agent1 = Agent.create({agentId: 1, name: 'agent 1'});
      agent1 = await agent1.save();
      agent1 = await Agent.findOne({agentId: 1});
      art3.agentAdd({role: 'primary', artist: agent1, comments: 'first'});
      await art3.save();
      art3 = await Art.findOne({artId: 30});
      let obj = art3.objectGet();
      assert.isDefined(obj.agents);
      assert.equal(obj.agents.length, 1);
      assert.equal(obj.agents[0].role, 'primary');
      assert.isDefined(obj.artist);

      // -- get the names of the artist
      art3 = await Art.findOne({artId: 30})
        .populate('agents.artist');
      obj = art3.objectGet();
      assert.isDefined(obj.agents);
      assert.equal(obj.agents.length, 1);
      assert.isDefined(obj.artist);
      assert.equal(obj.artist.name, 'agent 1');
    });

    it('update artist to member, but primary artist remains (is first one)', async() => {
      art3.agentUpdate( 0, {role: 'member'});
      await art3.save();
      art3 = await Art.findOne({artId: 30})
        .populate('agents.artist');
      let obj = art3.objectGet();
      assert.isDefined(obj.agents);
      assert.equal(obj.agents.length, 1);
      assert.isDefined(obj.artist);
      assert.equal(obj.artist.name, 'agent 1');
    });

    it('add other member', async() => {
      agent2 = Agent.create({agentId: 2, name: 'agent 2'});
      agent2 = await agent2.save();
      agent2 = await Agent.findOne({agentId: 2});
      art3.agentAdd({role: 'primary', artist: agent2});
      await art3.save();
      art3 = await Art.findOne({artId: 30})
        .populate('agents.artist');
      let obj = art3.objectGet();
      assert.isDefined(obj.agents);
      assert.equal(obj.agents.length, 2);
      assert.isDefined(obj.artist);
      assert.equal(obj.artist.name, 'agent 2');

      // -- make none primary
      art3.agentUpdate(1,{role: 'member', artist: agent2});
      await art3.save();
      art3 = await Art.findOne({artId: 30})
        .populate('agents.artist');
      obj = art3.objectGet();
      assert.isDefined(obj.agents);
      assert.equal(obj.agents.length, 2);
      assert.isDefined(obj.artist);
      assert.equal(obj.artist.name, 'agent 1');
    });

    it('remove agent', async () => {
      // -- make none primary
      art3.agentUpdate(1);
      await art3.save();
      art3 = await Art.findOne({artId: 30})
        .populate('agents.artist');
      obj = art3.objectGet();
      assert.isDefined(obj.agents);
      assert.equal(obj.agents.length, 1);

    })
  })
});
