/**
 * import definition for the codes
 *
 */
const DbMySQL = require('../lib/db-mysql');
const Code = require('../model/code');
const Logging = require('../lib/logging');
const recordValue = require('../import/import-helper').recordValue;
const makeNumber = require('../import/import-helper').makeNumber;



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
    let code = await Code.findOne({codeId: record.code_ID});
    if (!code) {
      code = await Code.create({codeId: record.code_ID});
    }
    let dataRec = {};
    for (let fieldName in FieldMap) {
      if (!FieldMap.hasOwnProperty(fieldName)) {
        continue
      }
      dataRec[fieldName] = await recordValue(record, FieldMap[fieldName], Code);
    }
    try {
      code.objectSet(dataRec);
      code = await code.save();
    } catch (e) {
      Logging.error(`error importing code[${record.code_ID}]: ${e.message}`)
    }
    return code;
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
        let sql = `SELECT * FROM code ORDER BY code_ID LIMIT ${start * vm._step}, ${vm._step}`;
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
      process.stdout.write('\r');
      return resolve(counter)
    })
  }

  async runOnData(record) {
    let con = DbMySQL.connection;
    return await this._convertRecord(con, record);
  }
}


module.exports = CodeImport;
module.exports.FieldMap = FieldMap;


