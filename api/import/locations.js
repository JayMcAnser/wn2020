/**
 * import routines for the location
 * version 0.0.1  Jay 2020-03-17
 */

const Distribution = require('../model/distribution');
const DbMySQL = require('../lib/db-mysql');
const Config = require('config');
const Logging = require('../lib/logging');
const Contact = require('../model/contact');
const Carrier = require('../model/carrier');
const ImportCarrier = require('../import/carriers');
const recordValue = require('../import/import-helper').recordValue;
const makeNumber = require('../import/import-helper').makeNumber;
const AddrFieldMap = require('./addresses').FieldMap;
const CarrierFieldMap = require('./carriers').FieldMap;
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

contactLink = async function(parent, addressId) {
  if (addressId) {
    let contact = await Contact.findOne({addressId: addressId});
    if (!contact) {
      let myCon = await DbMySQL.connect();
      let myContact = await myCon.query('SELECT * FROM addresses WHERE address_ID=?', [addressId]);
      if (myContact.length === 0) {
        contact = await Contact.findField({guid: 'DISTR_NOT_FOUND'});
        if (contact.length === 0) {
          Logging.error(`the contact.guid DISTR_NOT_FOUND does not exist. Must run Setup`);
          return undefined;
        }
        contact = contact[0];
      } else {
        contact = await Contact.create({addressId: addressId, isEmpty: false});
      }
      if (Config.get('Sync.pullAddress')) {
        if (myContact.length) {
          for (let fieldName in AddrFieldMap) {
            contact[fieldName] = _recordValue(myContact[0], AddrFieldMap[fieldName]);
          }
          contact = await contact.save();
        }
      }
    }
    return contact;
  }
  return undefined;
};

carrierLink = async function(parent, carrierId) {
  if (carrierId){
    let carrier = await parent.findOne({carrierId: carrierId});
    if (!carrier) {
      let myCon = await DbMySQL.connect();
      let myCarrier = await myCon.query('SELECT * FROM carrier WHERE carrier_ID=?', [carrierId]);
      if (myCarrier.length === 0) {
        carrier = await Carrier.findField({locationNumber: 'CARRIER_NOT_FOUND'});
        if (carrier.length === 0) {
          Logging.error(`the carrier.locationNumber == CARRIER_NOT_FOUND does not exist. Looking for id: ${carrierId}. Must run Setup`);
          return undefined;
        }
        return carrier[0]._id.toString();
      } else {
        carrier = await Carrier.create({carrierId: carrierId, isEmpty: false});
      }
      if (Config.get('Sync.pullCarrier')) {
        if (myCarrier.length) {
          let imp = new ImportCarrier();
          await imp.runOnData(myCarrier[0]);
        }
      }
    }
    return carrier._id.toString();
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
            let v = await recordValue(rec, itemMap[fieldName], Carrier);
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
