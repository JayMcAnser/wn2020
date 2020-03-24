/**
 * import definition for the carriers
 *
 */
const DbMySQL = require('../lib/db-mysql');
const Carrier = require('../model/carrier');
const recordValue = require('../import/import-helper').recordValue;
const makeNumber = require('../import/import-helper').makeNumber;



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
      default: return `err-${rec[objectType_ID]}`;
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

class CarrierImport {

  constructor(options= {}) {
    this._limit = options.limit !== undefined ? options.limit : 0;
    this._step = 5;
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
      carrier.objectSet(dataRec);
      carrier = await carrier.save();
    } catch (e) {
      Logging.error(`error importing carrier[${record.carrier}]: ${e.message}`)
    }
    return carrier;
  }

  async run(con) {
    let rotate = ['|','/','-','\\'];
    let vm = this;
    return new Promise(async (resolve, reject) => {
      let start = 0;
      let counter = { count: 0, add: 0, update: 0, errors: []};
      let qry = [];
      do {
        let dis;
        let sql = `SELECT * FROM carrier ORDER BY carrier_ID LIMIT ${start * vm._step}, ${vm._step}`;
        qry = await con.query(sql);
        if (qry.length > 0) {
          for (let l = 0; l < qry.length; l++) {
            await this._convertRecord(con, qry[l]);
            counter.count++;
          }
          start++;
          let x = rotate[start % 4];
          process.stdout.write(`\r${x}`);
        }
      } while (qry.length > 0 && (this._limit === 0 || counter.count < this._limit));
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
