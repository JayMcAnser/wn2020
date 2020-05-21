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
const Session = require('../lib/session');


const ROLE_CREATOR = require('../model/art').ROLE_CREATOR;
const ROLE_CONTRIBUTOR = require('../model/art').ROLE_CONTRIBUTOR;
const ROLE_SUBJECT = require('../model/art').ROLE_SUBJECT;


describe('model.art', () => {

  let art;
  let artObj;
  let session;

  before( () => {
    session = new Session('art.spec')
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
    art = await Art.queryOne(session, {art: '1'});
    if (!art) {
      art = Art.create(session, {artId: '1', title: 'art.test 1'});
      await art.save();
      art = await Art.queryOne(session, {artId: '1'});
    }
    assert.equal(art.artId, 1);
    assert.equal(art.title, 'art.test 1');
  });

  it('load codes', async () => {
    let code1 = Code.create(session, {codeId: 12, text: 'code 12'});
    code1 = await code1.save();
    let art2 = Art.create(session, {artId: 12, title: 'art 12', codes: [code1]});
    art2 = await art2.save();
    art2 = await Art.findOne({artId: 12})
      .populate('codes')
    ;
    art2.session(art2)
    assert.isDefined(art2.codes);
    assert.equal(art2.codes.length, 1);
    assert.equal(art2.codes[0].text, 'code 12')

    // without the populate
    art2 = await Art.queryOne(session,{artId: 12});
    assert.isDefined(art2.codes);
    assert.equal(art2.codes.length, 1);


    let code2 = Code.create(session, {codeId: 22, text: 'code 22'});
    code2 = await code2.save();
    art2.codeAdd(code2);
    await art2.save()
    art2 = await Art.queryOne(session, {artId: 12});
    assert.equal(art2.codes.length, 2);

  });


  describe('agents', () => {
    // * Agent rules:
    //     *   - agentAdd(agent | data.agent), agentUpdate(index | ObjectId, data), agentRemove(index| ObjectId)
    //   *   - unique
    //   *     * the agent must be unique. If duplicate is created the new one replaces the old one
    //   *
    //   *   - creator
    //   *     * only one agent can be creator
    //   *     * if none is creator, index=0 is primary if not ROLE_SUBJECT
    //   *     * if more then 1 primary, latest creator set will become creator
    //   *     * creatorAgent is a virtual into the agent array
    //   *
    //   *  - royalties
    //   *     * total is always 100 (%)
    //   *     * 100 - (the sum of the not primary) is the royalties for the primary
    //   *     * if primary.royalties < 0 throw an error and no save
    //   *     * can be set in one call by setRoyalties[{_id, royaltiesPerc}, {_id, royaltiesPerc}] where primary can be missing
    //   *     * royaltiesValid checkes if all percentages are ok
    //   *
    let art3;
    let agent2;
    let agent1;

    before(async() => {
      art3 = Art.create(session, {artId: 30, title: 'art 30'});
      art3 = await art3.save();
      art3 = await Art.queryOne(session, {artId: 30})
    });

    it('add one artist', async () => {
      agent1 = Agent.create(session, {agentId: 1, name: 'agent 1'});
      agent1 = await agent1.save();
      agent1 = await Agent.findOne({agentId: 1});
      art3.agentAdd({role: ROLE_CREATOR, agent: agent1, comments: 'first'});
      await art3.save();
      art3 = await Art.queryOne(session,{artId: 30});
      assert.isDefined(art3.agents);
      assert.equal(art3.agents.length, 1);
      assert.equal(art3.agents[0].role, ROLE_CREATOR);
      assert.equal(art3.agents[0].percentage, 100);
      assert.isDefined(art3.creatorIndex);
      assert.equal(art3.creatorIndex, 0);

      // -- get the names of the artist
      // TODO: adjust when agent is in v0.2
      art3 = await Art.findOne({artId: 30})
        .populate('agents.agent');
      art3.session(session);
      assert.isDefined(art3.agents);
      assert.equal(art3.agents.length, 1);
      assert.isDefined(art3.creator);
      assert.equal(art3.creator.name, 'agent 1');
      assert.equal(art3.creator.royaltiesPercentage, 100, 'field is temporary moved to the agent');
    });

    it('add other member', async() => {
      agent2 = Agent.create(session, {agentId: 2, name: 'agent 2'});
      agent2 = await agent2.save();
      agent2 = await Agent.findOne({agentId: 2});
      art3.agentAdd({role: ROLE_CREATOR, agent: agent2, percentage: 100});
      await art3.save();
      art3 = await Art.queryOne(session,{artId: 30});
      assert.isDefined(art3.agents);
      assert.equal(art3.agents.length, 2);
      assert.equal(art3.creatorIndex, 1);
      assert.equal(art3.agents[1].percentage, 100);
      assert.equal(art3.agents[0].percentage, 0);
      assert.equal(art3.agents[0].role, ROLE_CONTRIBUTOR);

      // -- make none primary
      art3.agentUpdate(0, { role: ROLE_CREATOR});
      await art3.save();
      art3 = await Art.findOne({artId: 30});
      assert.isDefined(art3.creatorIndex, 0);
      assert.equal(art3.agents[0].percentage, 100);
      assert.equal(art3.agents[1].percentage, 0);

      // give some money to the contributor
      art3.agentUpdate(1, { percentage: 25 });
      await art3.save();
      art3 = await Art.findOne({artId: 30});
      assert.equal(art3.agents[0].percentage, 75);
      assert.equal(art3.agents[1].percentage, 25);

      // make the contributor creator
      art3.agentUpdate(1, { role: ROLE_CREATOR });
      await art3.save();
      art3 = await Art.findOne({artId: 30});
      assert.equal(art3.agents[0].percentage, 0);
      assert.equal(art3.agents[1].percentage, 100);

      // throw an error if percentage is wrong
      assert.throws( () => {art3.agentUpdate(0, { percentage: 110 })}, Error, 'the total of the royalties percentages (110%) is more the 100%');
    });

    it('remove agent', async () => {
      // -- remove creator will promote an otherone to creator
      art3.agentRemove(1);
      await art3.save();
      art3 = await Art.findOne({artId: 30})
      assert.equal(art3.agents.length, 1);
      assert.equal(art3.agents[0].percentage, 100)
      assert.equal(art3.agents[0].role, ROLE_CREATOR)
    })
  });



  describe('url', () => {
    it('accept url', async() => {
      art.urlAdd('www.test.com');
      await art.save();
      art = await Art.findOne({artId: art.artId});
      assert.isDefined(art.urls);
      assert.equal(art.urls.length, 1);
      assert.equal(art.urls[0], 'www.test.com');
    });
    it('test unique', () => {
      assert.isDefined(art.urls);
      assert.equal(art.urls.length, 1);
      art.urlAdd('www.test.com');
      assert.equal(art.urls.length, 1, 'did not change');
    });

    it('update at once', () => {
      art.urlAdd('example.com');
      art.urlSet(['example.com', 'none.com']);
      assert.equal(art.urls.length, 2)
      assert.isTrue(art.urls.indexOf('example.com') >= 0);
      assert.isTrue(art.urls.indexOf('www.test.com') < 0);
    })
  });

});
