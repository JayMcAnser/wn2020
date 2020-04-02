
const DbMySQL = require('../lib/db-mysql');
const Agent = require('../model/agent');
const Logging = require('../lib/logging');
const recordValue = require('./import-helper').recordValue;
const makeNumber = require('./import-helper').makeNumber;
const makeLength = require('./import-helper').makeLength;
const insertField = require('./import-helper').insertField;
const ImportHelper = require('./import-helper');
const CodeImport = require('./codes');

const FieldMap = {
  agentId: 'agent_ID',
  type: (rec) => {
    switch (rec.objecttype_ID) {
      case 256:
        return 'artist in distribution';
      case 257:
        return 'artist';
      case 512:
        return 'collective in distribution';
      case 1025:
        return 'collective';
      default:
        return `Unknown (${rec.objecttype_ID})`
    }
  },
  name: 'name',
  sortOn: 'sort_on',
  died: 'died',
  biography: 'biography_en',
  biographyNl: 'biography_nl',
  comments: 'comments',
  born: 'born',
  bornInCountry: 'born_in_country',
  customerNr: 'customer_number',
  percentage: 'royalties_percentage',
};

class AgentImport {
  constructor(options = {}) {
    const STEP = 5
    this._limit = options.limit !== undefined ? options.limit : 0;
    this._step = this._limit < STEP ? this._limit : STEP;
    this._codeImport = new CodeImport();
  }

  /**
   * internal converting a record
   *
   * @param record
   * @param options Object
   *   - loadSql Boolean load the sql record if not found
   * @return {Promise<{}>}
   * @private
   */
  async _convertRecord(con, record, options = {}) {
    let agent = await Agent.findOne({agentId: record.agent_ID});
    if (agent) {
      return agent;
    }
    let sql;
    let qry;
    if (options.loadSql) {
      sql = `SELECT * FROM agent WHERE agent_ID=${record.agent_ID}`;
      qry = await con.query(sql);
      if (qry.length === 0) {
        Logging.warn(`agent[${record.agent_ID}] does not exist. skipped`);
        return undefined
      }
      record = qry[0];
    }
    let dataRec = {};
    for (let fieldName in FieldMap) {
      if (!FieldMap.hasOwnProperty(fieldName)) {
        continue
      }
      dataRec[fieldName] = await recordValue(record, FieldMap[fieldName], Agent);
    }
    //-- add the codes
    sql = `SELECT * FROM agent2code WHERE agent_ID=${record.agent_ID}`;
    qry = await con.query(sql);
    for (let codeIndex = 0; codeIndex < qry.length; codeIndex++) {
      let code = await this._codeImport.runOnData(qry[codeIndex], {loadSql: true})
      if (code) {
        if (dataRec.codes === undefined) {
          dataRec.codes = [code.id]
        } else {
          dataRec.codes.push(code.id)
        }
      }
    }
    try {
      // should also import the agent
      agent = Agent.create(dataRec);
      agent = await agent.save();
    } catch (e) {
      Logging.error(`error importing agent[${record.agent_ID}]: ${e.message}`)
    }
    return agent;
  }

  async run(con) {
    let vm = this;
    return new Promise(async (resolve, reject) => {
      let stagent = 0;
      let counter = {count: 0, add: 0, update: 0, errors: []};
      let qry = [];
      ImportHelper.stepStart('Agent');
      do {
        let dis;
        let sql = `SELECT * FROM agent ORDER BY agent_ID LIMIT ${stagent * vm._step}, ${vm._step}`;
        qry = await con.query(sql);
        if (qry.length > 0) {
          for (let l = 0; l < qry.length; l++) {
            await this._convertRecord(con, qry[l]);
            ImportHelper.step(counter.count++);
          }
        }
        stagent++;
      } while (qry.length > 0 && (this._limit === 0 || counter.count < this._limit));
      ImportHelper.stepEnd('Agent');
      return resolve(counter)
    })
  }

  async runOnData(record, options = {}) {
    let con = DbMySQL.connection;
    return this._convertRecord(con, record, options);
  }
}
module.exports = AgentImport;
