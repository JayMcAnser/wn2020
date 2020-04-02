/**
 * import definition for the carriers
 *
 */
const DbMySQL = require('../lib/db-mysql');
const Carrier = require('../model/carrier');
const ArtImport = require('./art');
const CodeImport = require('./codes');
const Logging = require('../lib/logging');
const recordValue = require('../import/import-helper').recordValue;
const makeNumber = require('../import/import-helper').makeNumber;
const ImportHelper = require('./import-helper');



const FieldMap = {
  type: (rec, mongoRec) => {
    switch(rec.objecttype_ID) {
      case 16: return 'tape';
      case 17: return 'cd';
      case 18: return 'dvd';
      case 19: return 'error-type';
      case 20: return 'object';
      case 21: return 'file';
      case 22: return 'lto';
      case 23: return 'image';
      default: return `err-${rec.objecttype_ID}`;
    }
  },
  locationNumber: 'location_number',
  searchCode: 'searchcode',
  creationDate: 'creation_date',
  mutationDate: 'modifed_date',
  comments: 'comments',
  recommend: 'recommend',
  collectionNumber: 'collection_number',
  technicalComments: 'technical_comments',
  winding: 'winding',
  compressionRate: 'compression_rate',
  createdFrom: 'created_from',
  conservationPhase: 'conservation_fase',
  aspectRatio: 'ascpectratio',
  videoCodec: 'videocodec',
  size: 'size',
  muxRate: 'muxrate',
  fps: 'FPS',
  filePath: 'tmp_filename',
  audioCodec: 'audiocodec',
  audioType: 'audiotype',
  audioRate: 'audiorate',
  modifications: 'modification',
  fileName: 'filename',
  fileLocationNumber: 'loc_number',
  extension: 'extension',
  ltoTapeNumber: 'lto_tape_number',
  ltoPositionNumber: 'lto_position_number',
  ltoMd5: 'file_md5',
  viewRating: 'view_rating_website'
};

const ArtToCarrierFieldMap = {
  startTime: 'start_time',
  endTime: 'end_time',
  source: 'source',
  locationNumber: 'location_number',
  collectionNumber: 'collection_number',
  videoCorrection: 'video_correction',
  audioCorrection: 'audio_correction',
  technicalComments: 'technical comments',
  videoGain: 'video gain',
  videoBlack: 'video black',
  videoChroma: 'video chroma',
  audioLeft: 'audio left',
  audioRight: 'audio right',
};

class CarrierImport {

  constructor(options= {}) {
    const STEP = 5;
    this._limit = options.limit !== undefined ? options.limit : 0;
    this._step = this._limit < STEP ? this._limit : STEP;
    this._artImport = new ArtImport();
    this._codeImport = new CodeImport();
  }

  /**
   * import one carrier record if it does not exist
   *
   * @param con
   * @param record
   * @param options
   * @return {Promise<*>}
   * @private
   */
  async _convertRecord(con, record, options = {}) {
    let carrier = await Carrier.findOne({carrierId: record.carrier_ID});
    if (!carrier) {
      carrier = await Carrier.create({carrierId: record.carrier_ID});
    }
    let dataRec = {};
    for (let fieldName in FieldMap) {
      if (!FieldMap.hasOwnProperty(fieldName)) {
        continue
      }
      dataRec[fieldName] = await recordValue(record, FieldMap[fieldName], Carrier);
    }
    try {

      // now process the art on this carrier
      let sql = `SELECT * FROM art2carrier WHERE carrier_ID=${record.carrier_ID}`;
      let qry = await con.query(sql);
      if (qry.length) {
        for (let l = 0; l < qry.length; l++) {
          let artId = qry[l].art_ID;
          let id = qry[l].a2c_ID;
          let art = await this._artImport.runOnData(qry[l], {loadSql: true}); // we have only artId, so look for the art
          let subRec = {art: art};
          // TODO: what if art is undefined
          for (let fieldName in ArtToCarrierFieldMap) {
            if (!ArtToCarrierFieldMap.hasOwnProperty(fieldName)) {
              continue
            }
            subRec[fieldName] = await recordValue(record, ArtToCarrierFieldMap[fieldName], Carrier);
          }
          // load the code that belong to these
          let sqlA2C = `SELECT * FROM a2c_2code WHERE a2c_ID=${id}`;
          let qryA2C = await con.query(sqlA2C);
          if (qryA2C.length) {
            for (let lA2C = 0; lA2C < qryA2C.length; lA2C++) {
              let codeA2C = await this._codeImport.runOnData(qryA2C[lA2C]);
              if (codeA2C) {
                if (!subRec.artCodes) {
                  subRec.artCodes = [codeA2C];
                } else {
                  subRec.artCodes.push(codeA2C);
                }
              }
            }
          }
          if (dataRec.artwork) {
            dataRec.artwork.push(subRec)
          } else {
            dataRec.artwork = [subRec];
          }
        }
      } else {
        dataRec['noArt'] = true;
      }
      carrier.objectSet(dataRec);
      carrier = await carrier.save();
    } catch (e) {
      Logging.error(`error importing carrier[${record.carrier_ID}]: ${e.message}`)
    }
    return carrier;
  }

  async run(con) {
    let vm = this;
    return new Promise(async (resolve, reject) => {
      let start = 0;
      ImportHelper.stepStart('Carrier');
      let counter = { count: 0, add: 0, update: 0, errors: []};
      let qry = [];
      do {
        let dis;
        let sql = `SELECT * FROM carrier ORDER BY carrier_ID LIMIT ${start * vm._step}, ${vm._step}`;
        qry = await con.query(sql);
        if (qry.length > 0) {
          for (let l = 0; l < qry.length; l++) {
            await this._convertRecord(con, qry[l]);
            ImportHelper.step(counter.count++);
          }
          start++;
        }
      } while (qry.length > 0 && (this._limit === 0 || counter.count < this._limit));
      ImportHelper.stepEnd('Carrier');
      return resolve(counter)
    })
  }

  async runOnData(record) {
    let con = DbMySQL.connection;
    return await this._convertRecord(con, record);
  }
}


module.exports = CarrierImport;
module.exports.FieldMap = FieldMap;

