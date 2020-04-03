/**
 * import routines for the location
 * version 0.0.1  Jay 2020-03-17
 */

const Distribution = require('../model/distribution');
const Logging = require('../lib/logging');
const Address = require('../model/address');
const recordValue = require('../import/import-helper').recordValue;
const makeNumber = require('../import/import-helper').makeNumber;
// left: Mongo, right: Mysql


const fieldMap = {
  locationId: 'location_ID',
  code: 'location_code',
  invoiceNumber: 'invoice_number',
  event: 'event',
  header: 'intro_text',
  comments: '',
  footer : 'footer_text',
  vat: 'btw_prc',
  contactId: async (rec) => { return await Address.link(rec.contact_address_ID) },
  contactName: 'contact_address_name',
  invoiceId: async (rec) => { return await Address.link(rec.invoice_address_ID)},
  invoiceName: 'invoice_address_name',
  mailId: async (rec) => { return await Address.link(rec.mail_address_ID)},

  shippingCosts: (rec) => { return makeNumber(rec.shipping_costs); },
  otherCosts: (rec) => { return makeNumber(rec.other_costs); },
  productionCosts: (rec) => { return makeNumber(rec.production_costs); },

};

class LocationImport {

  constructor(options= {}) {
    this._limit = options.limit !== undefined ? options.limit : 0;
    this._step = 5;
  }

  async _convertRecord(record, options = {}) {
    let dis = await Distribution.findOne({locationId: record.location_ID});
    if (!dis) {
      dis = {}
    }
    for (let fieldName in fieldMap) {
      if (!fieldMap.hasOwnProperty(fieldName)) {
        continue
      }
      dis[fieldName] = await recordValue(record, fieldMap[fieldName], dis);
    }
    try {
      if (dis._id) {
        dis = await dis.save();
      } else {
        dis = await Distribution.create(dis);
      }
    } catch (e) {
      Logging.error(`error importing location[${record.location_ID}]: ${e.message}`)
    }
    return dis;
  }

  async run(con) {
    let vm = this;
    return new Promise(async (resolve, reject) => {
      let start = 0;
      let counter = { count: 0, add: 0, update: 0, errors: []};
      let qry = [];
      do {
        let dis;
        let sql = `SELECT * FROM locations WHERE objecttype_ID > 0 ORDER BY location_code LIMIT ${start * vm._step}, ${vm._step}`;
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

module.exports = LocationImport;
