/**
 * import definition for the codes
 *
 */
const DbMySQL = require('../lib/db-mysql');
const Code = require('../model/code');
const Logging = require('../lib/logging');
const recordValue = require('../import/import-helper').recordValue;
const makeNumber = require('../import/import-helper').makeNumber;
const ImportHelper = require('./import-helper');


const FieldMap = {
  guid: 'code_GUID',
  groupId: 'group_ID',
  parentId: 'parent_ID',
  baseGroupId: 'basegroup_ID',
  useCodeId: 'use_code_ID',
  typeId: 'type_ID',
  fieldTypeId: 'fieldtype_ID',
  isDefault: 'is_default',
  text: 'text',
  textNl: 'text_nl',
  useDescription: 'use_description',
  description: 'description',
  descriptionNl: 'description_nl',
  short: 'short',
  groupOn: 'group_on',
  sortOn: 'sort_on',
  sortOnNl: 'sort_on_nl',
  notUsed: 'not_used',
};

class CodeImport {

  constructor(options= {}) {
    const STEP = 5;
    this._limit = options.limit !== undefined ? options.limit : 0;
    this._step = this._limit < STEP ? this._limit : STEP;
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
    let code = await Code.findOne({codeId: record.code_ID});
    if (code) {
      return code;
    }
    let sql;
    let qry;
    if (options.loadSql) {
      sql = `SELECT * FROM codes WHERE code_ID=${record.code_ID}`;
      qry = await con.query(sql);
      if (qry.length === 0) {
        Logging.warn(`code[${record.art_ID}] does not exist. skipped`);
        return undefined
      }
      record = qry[0];
    }
    let dataRec = {codeId: record.code_ID};
    for (let fieldName in FieldMap) {
      if (!FieldMap.hasOwnProperty(fieldName)) {
        continue
      }
      dataRec[fieldName] = await recordValue(record, FieldMap[fieldName], Code);
    }
    try {
      code = Code.create(dataRec);
      code = await code.save();
    } catch (e) {
      Logging.error(`error importing code[${record.code_ID}]: ${e.message}`)
    }
    return code;
  }

  async run(con) {
    let vm = this;
    return new Promise(async (resolve, reject) => {
      let start = 0;
      let counter = { count: 0, add: 0, update: 0, errors: []};
      let qry = [];
      do {
        let dis;
        let sql = `SELECT * FROM codes ORDER BY code_ID LIMIT ${start * vm._step}, ${vm._step}`;
        qry = await con.query(sql);
        if (qry.length > 0) {
          for (let l = 0; l < qry.length; l++) {
            await this._convertRecord(con, qry[l]);
            counter.count++;
          }
          ImportHelper.step(start++);
        }
      } while (qry.length > 0 && (this._limit === 0 || counter.count < this._limit));
      ImportHelper.stepDone();
      return resolve(counter)
    })
  }

  /**
   *
   * @param record Object containing code_ID
   * @param options Object
   *      - loadSql Boolean if true the sql record is loaded from disk
   * @return {Promise<*>}
   */
  async runOnData(record, options = {}) {
    let con = DbMySQL.connection;
    return await this._convertRecord(con, record, options);
  }
}


module.exports = CodeImport;
module.exports.FieldMap = FieldMap;


