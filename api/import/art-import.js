
const DbMySQL = require('../lib/db-mysql');
const Art = require('../model/art');
const Logging = require('../lib/logging');
const CodeImport = require('./code-import');
const AgentImport = require('../import/agent-import');
const recordValue = require('./import-helper').recordValue;
const makeNumber = require('./import-helper').makeNumber;
const makeLength = require('./import-helper').makeLength;
const insertField = require('./import-helper').insertField;
const ImportHelper = require('./import-helper');

const ROLE_CREATOR = require('../model/art').ROLE_CREATOR;
const ROLE_CONTRIBUTOR = require('../model/art').ROLE_CONTRIBUTOR;
const ROLE_SUBJECT = require('../model/art').ROLE_SUBJECT;

// left: Mongo, right: Mysql


const FieldMap = {

  artId: 'art_ID',
  code: 'searchcode',
  type: (rec) => {
    switch (rec.objecttype_ID) {
      case 1:
        return 'video';
      case 2:
        return 'installation';
      case 5:
        return 'channel';
      default:
        return `unknown (${rec.objecttype_ID})`
    }
  },
  searchcode: 'searchcode',
  comments: 'comments',
  sortOn: 'sort_on',
  title: 'title',
  titleEn: 'title_en',
  yearFrom: 'year_from',
  yearTill: 'year_till',
  length: (rec) => { return makeLength(rec.length)},
  descriptionNl: 'description_nl',
  description: 'description',
  hasSound: 'sound',
  audio: 'audio',
  credits: 'credits',
  presentationPlayback: (rec, mongoRec) => {
    return insertField(rec.presentation_playback, 'playback', 'presentation', mongoRec, 'fields');
  },
  presentationMonitors: (rec, mongoRec) => {
    return insertField(rec.presentation_monitors, 'monitors', 'presentation', mongoRec, 'fields');
  },
  presentationProjectors: (rec, mongoRec) => {
    return insertField(rec.presentation_projectors, 'projectors', 'presentation', mongoRec, 'fields');
  },
  presentationAmplifierSpeakers: (rec, mongoRec) => {
    return insertField(rec.presentation_amplifier_speakers, 'amplifier, speakers', 'presentation', mongoRec, 'fields');
  },
  presentationComputersSoftware: (rec, mongoRec) => {
    return insertField(rec.presentation_computers_software, 'computer / software', 'presentation', mongoRec, 'fields');
  },
  presentationInstallation: (rec, mongoRec) => {
    return insertField(!!rec.presentation_installation, 'installation', 'presentation', mongoRec, 'fields');
  },
  presentationMonitor: (rec, mongoRec) => {
    return insertField(!!rec.presentation_monitor, 'monitor', 'presentation', mongoRec, 'fields');
  },
  presentationProjection: (rec, mongoRec) => {
    return insertField(!!rec.presentation_projection, 'projection', 'presentation', mongoRec, 'fields');
  },
  persentationCarriers: (rec, mongoRec) => {
    return insertField(rec.persentation_carriers, 'carriers', 'presentation', mongoRec, 'fields');
  },
  presentationObjects: (rec, mongoRec) => {
    return insertField(rec.presentation_objects, 'object', 'presentation', mongoRec, 'fields');
  },
  presentationSpace: (rec, mongoRec) => {
    return insertField(rec.presentation_space, 'space', 'presentation', mongoRec, 'fields');
  },
  presentationSupport: (rec, mongoRec) => {
    return insertField(rec.presentation_support, 'support', 'presentation', mongoRec, 'fields');
  },
  installationInstructions: (rec, mongoRec) => {
    return insertField(rec.installation_instructions, 'instructions', 'installation', mongoRec, 'fields');
  },
  installationHandling: (rec, mongoRec) => {
    return insertField(rec.installation_handling, 'handeling', 'installation', mongoRec, 'fields');
  },
  preservationDescription: (rec, mongoRec) => {
    return insertField(rec.preservation_description, 'description', 'preservation', mongoRec, 'fields');
  },
  preservationHistory: (rec, mongoRec) => {
    return insertField(rec.preservation_history, 'history', 'preservation', mongoRec, 'fields');
  },
  preservationArtistOpinion: (rec, mongoRec) => {
    return insertField(rec.preservation_artist_opinion, 'artist opinion', 'preservation', mongoRec, 'fields');
  },
  preservationIrreplacable_parts: (rec, mongoRec) => {
    return insertField(rec.preservation_irreplacable_parts, 'irreplacable parts', 'preservation', mongoRec, 'fields');
  },
  preservationProduction: (rec, mongoRec) => {
    return insertField(rec.preservation_production, 'production', 'preservation', mongoRec, 'fields');
  },
  preservationRecommendations: (rec, mongoRec) => {
    return insertField(rec.preservation_recommendations, 'recommendations', 'preservation', mongoRec, 'fields');
  },

};

class ArtImport {
  constructor(options = {}) {
    this.session = options.session;
    this._limit = options.limit !== undefined ? options.limit : 0;
    this._step = 5;
    this._codeImport = new CodeImport({session: this.session});
    this._agentImport = new AgentImport({ session: this.session});
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
    let art = await Art.queryOne(this.session,{artId: record.art_ID});
    if (art) {
      return art;
    }
    let sql;
    let qry;
    if (options.loadSql) {
      sql = `SELECT * FROM art WHERE art_ID=${record.art_ID}`;
      qry = await con.query(sql);
      if (qry.length === 0) {
        Logging.warn(`art[${record.art_ID}] does not exist. skipped`);
        return undefined
      }
      record = qry[0];
    }
    let dataRec = {};
    for (let fieldName in FieldMap) {
      if (!FieldMap.hasOwnProperty(fieldName)) {
        continue
      }
      dataRec[fieldName] = await recordValue(record, FieldMap[fieldName], Art);
    }
    //-- add the codes
    sql = `SELECT * FROM art2code WHERE art_ID=${record.art_ID}`;
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
    art = Art.create(this.session, dataRec);
    // add the urls
    sql = `SELECT * FROM art_url WHERE art_ID=${record.art_ID}`;
    qry = await con.query(sql);
    for (let urlIndex = 0; urlIndex < qry.length; urlIndex++) {
      art.urls.push(qry[urlIndex].url);
    }

    // add agents
    sql = `SELECT * FROM agent2art WHERE art_ID=${record.art_ID} ORDER BY role_ID`;
    qry = await con.query(sql);
    for (let agentIndex = 0; agentIndex < qry.length; agentIndex++) {
      let agent = await this._agentImport.runOnData(qry[agentIndex], {loadSql: true});
      if (agent) {
        let role;
        switch (qry[agentIndex].role_ID) {
          case 2201: role = ROLE_CREATOR; break;
          case 2202: role = ROLE_CONTRIBUTOR; break;
          case 2203: role = ROLE_SUBJECT; break;
          default: role = `unknown (${agent[agentIndex].role_ID})`
        }
        art.agentAdd({ agent, percentage: qry[agentIndex].percentage, role })
      }
    }
    try {
      if (art.agents.length === 0) {
        Logging.warn(`missing agents of artId: ${art.artId}`);
      }
      await art.reSync();
      art = await art.save();
    } catch (e) {
      Logging.error(`error importing art[${record.art_ID}]: ${e.message}`)
    }
    return art;
  }

  async run(con) {
    let vm = this;
    return new Promise(async (resolve, reject) => {
      let start = 0;
      let counter = {count: 0, add: 0, update: 0, errors: []};
      let qry = [];
      ImportHelper.stepStart('Art');
      do {
        let dis;
        let sql = `SELECT * FROM art ORDER BY art_ID LIMIT ${start * vm._step}, ${vm._step}`;
        qry = await con.query(sql);
        if (qry.length > 0) {
          for (let l = 0; l < qry.length; l++) {
            await this._convertRecord(con, qry[l]);
            ImportHelper.step(counter.count++);
          }
        }
        start++;
      } while (qry.length > 0 && (this._limit === 0 || counter.count < this._limit));
      ImportHelper.stepEnd('Art');
      return resolve(counter)
    })
  }

  async runOnData(record, options = {}) {
    let con = DbMySQL.connection;
    return this._convertRecord(con, record, options);
  }
}
module.exports = ArtImport;
