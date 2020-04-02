/**
 * Test the import Agent
 */

const Db = require('./init.db');
const DbMySql = Db.DbMySQL;
const DbMongo = Db.DbMongo;
const chai = require('chai');
const assert = chai.assert;
const ImportAgent = require('../import/agents');
const Agent = require('../model/agent');
const Setup = require('../lib/setup');

describe('import.agent', function() {
  this.timeout('10000');

  let mySQL;
  before(() => {
    return Agent.deleteMany({}).then(() => {
      return DbMySql.connect().then((con) => {
        mySQL = con;
        let setup = new Setup();
        return setup.run();
      })
    })
  });

  it('check field information', () => {
    let record =  {
      "agent_ID": 1,
      "objecttype_ID": 512,
      "name": "name",
      "sort_on": "sort on",
      "address_ID": 3,
      "rights_ID": 3,
      "contact_ID": 3,
      "died": "died",
      "biography_en": "bio en",
      "biography_nl": "bio nl",
      "comments": "comments",
      "born": "born",
      "born_in_country": "born country",
      "customer_number": "customer nr",
      "royalties_percentage": 50
    };
    let imp = new ImportAgent();
    return imp.runOnData(record).then( (mRec) => {
      let obj = mRec.objectGet();
      assert.equal(obj.type, "collective in distribution");
      assert.equal(obj.name, 'name');
      assert.equal(obj.sortOn, 'sort on');
      assert.equal(obj.died, 'died');
      assert.equal(obj.biography, 'bio en');
      assert.equal(obj.biographyNl, 'bio nl');
      assert.equal(obj.comments, 'comments');
      assert.equal(obj.born, 'born');
      assert.equal(obj.bornInCountry, 'born country');
      assert.equal(obj.customerNr, 'customer nr');
      assert.equal(obj.percentage, 50);
    })
  });

  it('run - clean', () => {
    const limit = 2;
    let imp = new ImportAgent({ limit: limit});
    return imp.run(mySQL).then( (result) => {
      assert.equal(result.count, limit)
    })
  });

  it('import full record codes', async () => {
    const limit = 10;
    let imp = new ImportAgent({ limit: limit});
    await imp.runOnData({agent_ID: 3});
    let agent = await Agent.findOne({agentId: 3});
    assert.isDefined(agent);
    assert.equal(agent.agentId, 3)
  })
});
