
const Art = require('../model/art');
const Logging = require('../lib/logging');
const recordValue = require('./import-helper').recordValue;
const makeNumber = require('./import-helper').makeNumber;
const makeLength = require('./import-helper').makeLength;
const insertField = require('./import-helper').insertField;
// left: Mongo, right: Mysql


const fieldMap = {

  artId: 'art_ID',
  code: 'searchcode',
  type: (rec) => {
    switch (rec.objecttype_ID) {
      case 1:
        return 'Video';
      case 2:
        return 'Installation';
      case 5:
        return 'Channel';
      default:
        return 'Unknown'
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
  description: 'description_nl',
  descriptionEn: 'description',
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
  preservationArtist_opinion: (rec, mongoRec) => {
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
    this._limit = options.limit !== undefined ? options.limit : 0;
    this._step = 5;
  }

  /**
   * internal converting a record
   *
   * @param record
   * @param options
   * @return {Promise<{}>}
   * @private
   */
  async _convertRecord(record, options = {}) {
    let art = await Art.findOne({artId: record.art_ID});
    if (!art) {
      art = {}
    }
    for (let fieldName in fieldMap) {
      if (!fieldMap.hasOwnProperty(fieldName)) {
        continue
      }
      let d = await recordValue(record, fieldMap[fieldName], art);
      if (d !== undefined) {
        art[fieldName] = d
      }
    }
    try {
      if (art._id) {
        art = await art.save();
      } else {
        art = await Art.create(art);
      }
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
      do {
        let dis;
        let sql = `SELECT * FROM art ORDER BY art_ID LIMIT ${start * vm._step}, ${vm._step}`;
        qry = await con.query(sql);
        if (qry.length > 0) {
          for (let l = 0; l < qry.length; l++) {
            this._convertRecord(qry[l]);
            counter.count++;
          }
          start++;
        }
      } while (qry.length > 0 && (this._limit === 0 || counter.count < this._limit));
      return resolve(counter)
    })
  }

  async runOnData(record) {
    return this._convertRecord(record);
  }
}
module.exports = ArtImport;
