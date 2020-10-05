/**
 * Test the distribution model
 */

const Db = require('./init.db').DbMongo;
const chai = require('chai');
const assert = chai.assert;
const Distribution = require('../model/distribution');
const Contact = require('../model/contact');
const Agent = require('../model/agent');
const Art = require('../model/art');
const Session = require('../lib/session');
const Util = require('../lib/util');


describe('model.distributio.royalties', () => {

  let contact;
  let dist;
  let art;
  let agent;
  let session;

  before( async () => {
    session = new Session('distribution');
    await Distribution.deleteMany({});
    await Contact.deleteMany({});
    await Agent.deleteMany({});
    await Art.deleteMany({});
    // await Carrier.deleteMany({})

    await Contact.insertMany([
        { name: 'contact 1', type: 'Man' },
        // check 5
        { name: 'contact 5-1', type: 'Man' },
        { name: 'contact 5-2', type: 'Man' },
        // check 7
        { name: 'contact 7-1', type: 'Man' },
        { name: 'contact 7-2', type: 'Man' },
      ]

    );
    contact = await Contact.find().sort({name: 1});

    await Agent.insertMany([
      // check 1
      {type: 'Artist', name: 'Artist 1', contacts: [ { contact: contact[0]._id, isArtist: true, percentage: 100} ]},
      // check 4
      {type: 'Artist', name: 'Artist 4', contacts: [ ]},
      // check 5
      {type: 'Artist', name: 'Artist 5-1', contacts: [ { contact: contact[1]._id, isArtist: true, percentage: 100} ]},
      {type: 'Artist', name: 'Artist 5-2', contacts: [ { contact: contact[2]._id, isArtist: true, percentage: 100} ]},
      // check 6
      {type: 'Artist', name: 'Artist 6-1', contacts: [ { contact: contact[1]._id, isArtist: true, percentage: 100} ]},
      {type: 'Artist', name: 'Artist 6-2', contacts: [ { contact: contact[2]._id, isArtist: true, percentage: 0} ]},
      // check 7
      {type: 'Artist', name: 'Artist 7', contacts: [ { contact: contact[3]._id, isArtist: true, percentage: 40}, { contact: contact[4]._id, isArtist: true, percentage: 60} ]},

    ])
    agent = await Agent.find().sort({ name: 1})

    await Art.insertMany([
      // check 1
      {type: 'Video', title: 'Title 1', agents:[{agent :agent[0], role: Art.ROLE_CONTRIBUTOR, percentage: 70}]},
      // check 3
      {type: 'Video', title: 'Title 3'},
      // check 4
      {type: 'Video', title: 'Title 4', agents:[{agent :agent[1], role: Art.ROLE_CONTRIBUTOR, percentage: 70}]},
      // check 5
      {type: 'Video', title: 'Title 5', agents:[{agent :agent[2], role: Art.ROLE_CONTRIBUTOR, percentage: 40}, {agent :agent[3], role: Art.ROLE_CONTRIBUTOR, percentage: 30}]},
      // check 6
      {type: 'Video', title: 'Title 6', agents:[{agent :agent[4], role: Art.ROLE_CONTRIBUTOR, percentage: 70}, {agent :agent[5], role: Art.ROLE_CONTRIBUTOR, percentage: 0}]},
      // check 7
      {type: 'Video', title: 'Title 7', agents:[{agent :agent[6], role: Art.ROLE_CREATOR, percentage: 70}]},

    ])
    art = await Art.find().sort({title: 1});

    await Distribution.insertMany([
      // check 1 => all well
      {code: '2020-0001', line: [{ order: '01', price: 10000, art: art[0]} ]},
      // check 2 => missing art
      {code: '2020-0002', line: [{ order: '01', price: 10000 } ]},
      // check 3 => no agent for art
      {code: '2020-0003', line: [{ order: '01', price: 10000, art: art[1]} ]},
      // check 4 => no contact for agent
      {code: '2020-0004', line: [{ order: '01', price: 10000, art: art[2]} ]},
      // check 5 => multiple artists combined
      {code: '2020-0005', line: [{ order: '01', price: 10000, art: art[3]} ]},
      // check 6 => multiple artists, one gets paid
      {code: '2020-0006', line: [{ order: '01', price: 10000, art: art[4]} ]},
      // check 7 - multiple contacts for one agent
      {code: '2020-0007', line: [{ order: '01', price: 10000, art: art[5]} ]},
    ]);
    dist = await Distribution.find().sort({code: 1});
  });

  it('single artist - everything on 100% ', async () => {
    // check 1 defintion
    await dist[0].royaltiesCalc();
    await dist[0].save();
    assert.equal(dist[0].lineCount(), 1);
    assert.equal(dist[0].royaltiesError, '');
    assert.equal(dist[0].line[0].royalties[0].artPercentage, 100);
    assert.equal(dist[0].line[0].royalties[0].agentPercentage, 70);
    assert.equal(dist[0].line[0].royalties[0].contactPercentage, 100);
    assert.equal(dist[0].line[0].royalties[0].amount, 7000)
  });

  it('missing art', async() => {
    // check 2 definition
    await dist[1].royaltiesCalc();
    await dist[1].save();
    assert.equal(dist[1].lineCount(), 1);
    assert.equal(dist[1].royaltiesError, 'line 0: no art found');
  })

  it('missing agent', async () => {
    // check 3 definition
    await dist[2].royaltiesCalc();
    await dist[2].save();
    assert.equal(dist[2].lineCount(), 1);
    assert.equal(dist[2].royaltiesError, 'line 0: no agent found');
  })

  it('art.agent missing contact', async () => {
    // check 4
    await dist[3].royaltiesCalc();
    await dist[3].save();
    assert.equal(dist[3].lineCount(), 1);
    assert.equal(dist[3].royaltiesError, 'line 0: no contacts defined');
  });

  it('multiple artists', async () => {
    // check 5
    await dist[4].royaltiesCalc();
    await dist[4].save();
    assert.equal(dist[4].lineCount(), 1);
    assert.equal(dist[4].line[0].royalties.length, 2)
    assert.equal(dist[4].line[0].royalties[0].artPercentage, 100);
    assert.equal(dist[4].line[0].royalties[0].agentPercentage, 40);
    assert.equal(dist[4].line[0].royalties[0].contactPercentage, 100);
    assert.equal(dist[4].line[0].royalties[0].amount, 4000)
    assert.isTrue(dist[4].line[0].royalties[0].contact.equals(contact[1]._id));
    assert.isTrue(dist[4].line[0].royalties[0].art.equals(art[3]._id));
    assert.isTrue(dist[4].line[0].royalties[0].agent.equals(agent[2]._id));

    assert.equal(dist[4].line[0].royalties[1].artPercentage, 100);
    assert.equal(dist[4].line[0].royalties[1].agentPercentage, 30);
    assert.equal(dist[4].line[0].royalties[1].contactPercentage, 100);
    assert.equal(dist[4].line[0].royalties[1].amount, 3000);
    assert.isTrue(dist[4].line[0].royalties[1].contact.equals(contact[2]._id))
    assert.isTrue(dist[4].line[0].royalties[1].art.equals(art[3]._id));
    assert.isTrue(dist[4].line[0].royalties[1].agent.equals(agent[3]._id));
  });

  it('multiple artists - one gets paid', async () => {
    // check 6
    await dist[5].royaltiesCalc();
    await dist[5].save();
    assert.equal(dist[5].lineCount(), 1);
    assert.equal(dist[5].line[0].royalties.length, 1)
    assert.equal(dist[5].line[0].royalties[0].artPercentage, 100);
    assert.equal(dist[5].line[0].royalties[0].agentPercentage, 70);
    assert.equal(dist[5].line[0].royalties[0].contactPercentage, 100);
    assert.equal(dist[5].line[0].royalties[0].amount, 7000)
  });

  it ('multiple contact - all paid', async() => {
    // check 7
    await dist[6].royaltiesCalc();
    await dist[6].save();
    assert.equal(dist[6].lineCount(), 1);
    assert.equal(dist[6].line[0].royalties.length, 2)
    assert.equal(dist[6].line[0].royalties[0].artPercentage, 100);
    assert.equal(dist[6].line[0].royalties[0].agentPercentage, 70);
    assert.equal(dist[6].line[0].royalties[0].contactPercentage, 40);
    assert.equal(dist[6].line[0].royalties[0].amount, 2800)

    assert.equal(dist[6].line[0].royalties[1].artPercentage, 100);
    assert.equal(dist[6].line[0].royalties[1].agentPercentage, 70);
    assert.equal(dist[6].line[0].royalties[1].contactPercentage, 60);
    assert.equal(dist[6].line[0].royalties[1].amount, 4200);
  })
});
