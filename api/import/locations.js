/**
 * import routines for the location
 * version 0.0.1  Jay 2020-03-17
 */

const Distribution = require('../model/distribution');
const DbMySQL = require('../lib/db-mysql');
const Config = require('config');
const Logging = require('../lib/logging');
// const Contact = require('../model/contact');
const Carrier = require('../model/carrier');
const ImportCarrier = require('../import/carriers');
const ImportContact = require('../import/contact');
const recordValue = require('../import/import-helper').recordValue;
const makeNumber = require('../import/import-helper').makeNumber;
// const AddrFieldMap = require('./contact').FieldMap;
// const CarrierFieldMap = require('./carriers').FieldMap;
const ImportHelper = require('./import-helper');


_recordValue = function(rec, part) {
  let result;
  if (typeof part === 'string') {
    result = rec[part]
  } else {
    result = part(rec);
  }
  if (typeof result === 'string') {
    result = result.trim();
  }
  if (result !== null && result && result.length) {
    return result;
  }
  return undefined;
};

let importContact = false;
contactLink = async function(parent, addressId) {
  if (addressId) {
    if (importContact === false) {
      importContact = new ImportContact();
    }
    return importContact.runOnData({address_ID: addressId}, {loadSql: true});
  }
  return undefined;
};

let importCarrier = false;
carrierLink = async function(parent, carrierId) {
  if (carrierId){
    if (importCarrier === false) {
      importCarrier = new ImportCarrier();
    }
    return importCarrier.runOnData({carrier_ID: carrierId}, {loadSql: true});
  }
  return undefined;
};



const ConvertMap = {
  locationId: 'location_ID',
  code: 'location_code',
  invoiceNumber: 'invoice_number',
  event: 'event',
  header: 'intro_text',
  comments: '',
  footer : 'footer_text',
  vat: 'btw_prc',

  contact: async (rec, mongoRec) => { return await contactLink(mongoRec, rec.contact_address_ID) },
  contactName: 'contact_address_name',
  invoice: async (rec, mongoRec) => { return await contactLink(mongoRec, rec.invoice_address_ID)},
  invoiceName: 'invoice_address_name',
  mail: async (rec, mongoRec) => { return await contactLink(mongoRec, rec.mail_address_ID)},

  shippingCosts: (rec) => { return makeNumber(rec.shipping_costs); },
  otherCosts: (rec) => { return makeNumber(rec.other_costs); },
  productionCosts: (rec) => { return makeNumber(rec.production_costs); },
};

const itemMap = {
  carrier: async (rec, mongoRec) => { return await carrierLink(mongoRec, rec.carrier_ID) },
  order: 'sort_on',
  price: (rec) => { return makeNumber(rec.price); },
};

class LocationImport {

  constructor(options= {}) {
    this._limit = options.limit !== undefined ? options.limit : 0;
    this._step = 5;
  }

  async _convertRecord(con, record, options = {}) {
    let dis = await Distribution.findOne({locationId: record.location_ID});
    if (!dis) {
      dis = await Distribution.create({locationId: record.location_ID});
    }
    let dataRec = {};
    for (let fieldName in ConvertMap) {
      if (!ConvertMap.hasOwnProperty(fieldName)) {
        continue
      }
      dataRec[fieldName] = await recordValue(record, ConvertMap[fieldName], Distribution);
    }
    try {
      dis.objectSet(dataRec);
      dis = await dis.save();

      // start converting lines of carriers
      let sql = 'SELECT * FROM location2carrier where location_ID = ' + dis.locationId;
      let qry = await con.query(sql);
      if (qry.length) {
        for (let recIndex = 0; recIndex < qry.length; recIndex++) {
          let rec = qry[recIndex];
          let lineRec = {};
          for (let fieldName in itemMap) {
            if (!itemMap.hasOwnProperty(fieldName)) {
              continue
            }
            let v = await recordValue(rec, itemMap[fieldName], Distribution);
            if (v !== undefined) {
              lineRec[fieldName] = v
            }
          }
          dis.lineAdd(lineRec)
//          console.log(lineRec)
        }
        dis  = await dis.save();
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
      ImportHelper.stepStart('Location')
      let counter = { count: 0, add: 0, update: 0, errors: []};
      let qry = [];
      do {
        let dis;
        let sql = `SELECT * FROM locations WHERE objecttype_ID > 0 ORDER BY location_code LIMIT ${start * vm._step}, ${vm._step}`;
        qry = await con.query(sql);
        if (qry.length > 0) {
          for (let l = 0; l < qry.length; l++) {
            await this._convertRecord(con, qry[l]);
            ImportHelper.step(counter.count++);
          }
          start++;
        }
      } while (qry.length > 0 && (this._limit === 0 || counter.count < this._limit));
      ImportHelper.stepEnd('Location');
      return resolve(counter)
    })
  }

  async runOnData(record) {
    let con = DbMySQL.connection;
    return await this._convertRecord(con, record);
  }
}

module.exports = LocationImport;
