
const DbMySQL = require('../lib/db-mysql');
const Contact = require('../model/contact');
const Logging = require('../lib/logging');
const CodeImport = require('../import/codes');
const recordValue = require('./import-helper').recordValue;
const makeNumber = require('./import-helper').makeNumber;
const makeLength = require('./import-helper').makeLength;
const insertField = require('./import-helper').insertField;
const ImportHelper = require('./import-helper');
// left: Mongo, right: Mysql


const FieldMap = {
  departement: 'department',
  subName: 'sub_name',
  firstName: 'firstName',
  title: 'title',
  firstLetters: 'firstLetters',
  insertion: 'name_insertion',
  name : 'name',
  suffix: 'name_suffix',
  search : 'search',
  sortOn: 'sortOn',
};

class ContactImport {
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
    let contact = await Art.findOne({addressId: record.address_ID});
    if (contact) {
      return contact;
    }
    let sql;
    let qry;
    if (options.loadSql) {
      sql = `SELECT * FROM address WHERE address_ID=${record.address_ID}`;
      qry = await con.query(sql);
      if (qry.length === 0) {
        Logging.warn(`address[${record.address_ID}] does not exist. skipped`);
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
    sql = `SELECT * FROM address2code WHERE address_ID=${record.address_ID}`;
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
      contact = Contact.create(dataRec);
      contact = await contact.save();
    } catch (e) {
      Logging.error(`error importing address[${record.address_ID}]: ${e.message}`)
    }
    return contact;
  }

  async run(con) {
    let vm = this;
    return new Promise(async (resolve, reject) => {
      let start = 0;
      let counter = {count: 0, add: 0, update: 0, errors: []};
      let qry = [];
      ImportHelper.stepStart('Contact');
      do {
        let dis;
        let sql = `SELECT * FROM art ORDER BY address_ID LIMIT ${start * vm._step}, ${vm._step}`;
        qry = await con.query(sql);
        if (qry.length > 0) {
          for (let l = 0; l < qry.length; l++) {
            await this._convertRecord(con, qry[l]);
            ImportHelper.step(counter.count++);
          }
        }
        start++;
      } while (qry.length > 0 && (this._limit === 0 || counter.count < this._limit));
      ImportHelper.stepEnd('Contact');
      return resolve(counter)
    })
  }

  async runOnData(record, options = {}) {
    let con = DbMySQL.connection;
    return this._convertRecord(con, record, options);
  }
}
module.exports = ArtImport;




module.exports.FieldMap = FieldMap;
