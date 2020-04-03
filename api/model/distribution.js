/**
 * A flex distribution model where the field can be define on-the-fly
 *
 */
const Mongoose = require('../lib/db-mongo');
const Schema = Mongoose.Schema;
const ErrorTypes = require('error-types');
const FlexModel = require('./flex-model-helper');
const Logging = require('../lib/logging');
const FieldSchema = require('./flex-model-helper').FieldSchema;
const ArtFieldMap = require('./art').FieldMap;
const CarrierFieldMap = require('./carrier').FieldMap;
const _ = require('lodash');
/**
 * do NOT start a field with _. It will be skipped in the get
 * @type {{def: {type: StringConstructor, required: boolean}, text: StringConstructor}}
 */
const DistributionFieldMap = {
  code: {type: 'string', name: 'code', group: 'general'},
  invoiceNumber: {type: 'string', name: 'invoice number', group: 'contact'},
  contact: {type: 'related', model: 'Contact', name: 'contact', group: 'general', getValue: (rec, mongoRec) => {
    if (rec.invoice === undefined) {
      rec.invoice = _.cloneDeep(rec.contact);
    }
    if (rec.mail === undefined) {
      rec.mail = _.cloneDeep(rec.contact)
    }
    return this.contact;
  }},
  contactName: {type: 'string', name: 'contact name', group: 'contact'},
  invoice: {type: 'related', model: 'Contact', name: 'invoice', group: 'contact'},
  invoiceName: {type: 'string', name: 'invoice name', group: 'contact'},
  mail: {type: 'related', model: 'Contact', name: 'mail', group: 'contact'},
  insertion: {type: 'string', name: 'insertion', group: 'general'},
  event: {type: 'string', name: 'event', group: 'general'},
  header: {type: 'string', name: 'header', group: 'general'},
  footer: {type: 'string', name: 'footer', group: 'general'},
  eventStartDate: {type: 'date', name: 'event start date', group: 'general'},
  evendEndDate: {type: 'date', name: 'event end date', group: 'general'},
  comments: {type: 'string', name: 'comments', group: 'general'},
  vat: {type: 'string', name: 'vat', group: 'general'},
  productionCosts: {type: 'number', name: 'production costs', group: 'general'},
  shippingCosts: {type: 'number', name: 'shipping costs', group: 'general'},
  otherCosts: {type: 'number', name: 'other costs', group: 'general'},
  otherCostsText: {type: 'string', name: 'costs reason', group: 'general'},

  // calculated get
  subTotalCosts: {
    type: 'number', name: 'sub total', group: 'finance', getValue: (rec, mongoRec) => {
      let result = 0;
      if (rec.line && rec.line.length) {
        for (let l = 0; l < rec.line.length; l++) {
          if (rec.line[l].price) {
            result += rec.line[l].price
          }
        }
      }
      return result;
    }
  },
  totalCosts: {
    type: 'number', name: 'total costs', group: 'finance', getValue: (rec, mongoRec) => {
      let result = rec.subTotalCosts;
      if (rec.productionCosts) {
        result += rec.productionCosts
      }
      if (rec.shippingCosts) {
        result += rec.shippingCosts
      }
      if (rec.otherCosts) {
        result += rec.otherCosts
      }
      return result;
    }
  }
};

const LineFieldMap = {
  order: {type: 'string', name: 'order', group: 'general'},     // the order of the lines
  price: {type: 'number', name: 'price', group: 'general'},     // price in cents
  quality: {type: 'string', name: 'quality', group: 'general'}  // requested quality if art is given
};
const LineSchema = {
  art: {
    type: Schema.ObjectId,
    ref: 'Art'
  },
  carrier: {
    type: Schema.ObjectId,
    ref: 'Carrier'
  },
  _fields: [FieldSchema],
};

const DistributionSchema = {
  locationId: String,
  _fields: [FieldSchema],
  line: [LineSchema],
};

let DistributionModel = new Schema(DistributionSchema);

/**
 * create a new ArtFlex.
 * Record fields can not be stored!
 * @param fields
 * @return {Promise|void|*}
 */
DistributionModel.statics.create = function(fields) {
  return FlexModel.create('Distribution', fields)
};


DistributionModel.statics.relations = function() {
  return {
    '/' : DistributionFieldMap,
    '/line': LineFieldMap,
    '/line/art': ArtFieldMap,
    '/line/carrier': CarrierFieldMap
  }
};

/**
 * store an object in the field definition
 * @param data
 */
DistributionModel.methods.objectSet = function(data) {
  return FlexModel.objectSet(this, DistributionFieldMap, data);
};

/**
 * create an object from the stored record
 *
 * @param fieldNames Array optional list of fields to store
 * @return {{}}
 */
DistributionModel.methods.objectGet = function(fieldNames = []) {
  return FlexModel.objectGet(this, DistributionFieldMap, fieldNames);
};

/**
 * the search is  {yearFrom: '1999'}
 * should become: {'_fields.string' : '1999', '_fields.def' : 'yearFrom'}
 */

DistributionModel.statics.findField = function(search = {}) {
  let qry = {};
  for (let key in search) {
    if (!search.hasOwnProperty(key)) { continue }
    qry['_fields.' + DistributionFieldMap[key].type] = search[key];
    qry['_fields.def'] = key;
  }
  let  f= this.find(qry);
  return this.find(qry);
};

/**
 *
 * @param itemData Art or Carrier or {art:, [field]: ...} or { carrier: , [fields]}
 */
DistributionModel.methods.lineAdd = function(itemData) {
  let itm = {
   // _fields: {}
  };
  if (itemData.art || itemData.carrier) {
    if (itemData.art) {
      itm.art = itemData.art._id === undefined ? itemData.art : itemData.art._id;
    } else if (itemData.carrier) {
      itm.carrier = itemData.carrier._id === undefined ? itemData.carrier : itemData.carrier._id;
    }
    FlexModel.objectSet(itm, LineFieldMap, itemData);
  } else {
    let model = itemData.constructor.modelName;
    if (!model || ['Carrer', 'Art'].indexOf(model) < 0) {
      Logging.warn('distribution: unknown line type');
      return;
    }
    itm[model.toLowerCase()] = itemData._id;
  }
  this.line.push(itm);
};

DistributionModel.methods.lineUpdate = function(index, itemData) {
  let ind = index;
  if (typeof index !== 'number') {
    for (ind = 0; ind < this.line.length; ind++) {
      if (index.toString() === this.line[ind].toString()) {
        break;
      }
    }
  }
  if (ind < this.line.length) {
    FlexModel.objectSet(this.line[ind], LineFieldMap, itemData);
    this.markModified('line');
  } else {
    throw new ErrorTypes.ErrorNotFound('line not found');
  }
};

DistributionModel.methods.lineRemove = function(index) {
  let ind = index;
  if (typeof index !== 'number') {
    for (ind = 0; ind < this.line.length; ind++) {
      if (index.toString() === this.line[ind].toString()) {
        break;
      }
    }
  }
  if (ind < this.line.length) {
    this.line.splice(ind, 1);
    this.markModified('line');
  } else {
    throw new ErrorTypes.ErrorNotFound('line not found');
  }
};
DistributionModel.methods.lineCount = function() {
  return this.line.length;
};
module.exports = Mongoose.Model('Distribution', DistributionModel);
module.exports.FieldMap = DistributionFieldMap;
module.exports.LineSchema = LineSchema;
