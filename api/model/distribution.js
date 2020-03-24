/**
 * A flex distribution model where the field can be define on-the-fly
 *
 */
const Mongoose = require('../lib/db-mongo');
const Schema = Mongoose.Schema;
const FlexModel = require('./flex-model-helper');
const FieldSchema = require('./flex-model-helper').FieldSchema;
/**
 * do NOT start a field with _. It will be skipped in the get
 * @type {{def: {type: StringConstructor, required: boolean}, text: StringConstructor}}
 */
const FieldMap = {
  code: {type: 'string', name: 'code', group: 'general'},
  invoiceNumber: {type: 'string', name: 'invoice number', group: 'general'},
  contact: {type: 'related', model: 'Address', name: 'contact', group: 'general'},
  contactName: {type: 'string', name: 'contact name', group: 'general'},
  invoice: {type: 'related', model: 'Address', name: 'invoice', group: 'general'},
  invoiceName: {type: 'string', name: 'invoice name', group: 'general'},
  mail: {type: 'related', model: 'Address', name: 'mail', group: 'general'},
  insertion: {type: 'string', name: 'insertion', group: 'general'},
  event: {type: 'string', name: 'event', group: 'general'},
  header: {type: 'string', name: 'header', group: 'general'},
  footer: {type: 'string', name: 'footer', group: 'general'},
  eventStartDate: {type: 'date', name: 'event start date', group: 'general'},
  evendEndDate: {type: 'date', name: 'event end date', group: 'general'},
  comments: {type: 'string', name: 'comments', group: 'general'},
  vat: {type: 'number', name: 'vat', group: 'general'},
  productionCosts: {type: 'number', name: 'production costs', group: 'general'},
  shippingCosts: {type: 'number', name: 'shipping costs', group: 'general'},
  otherCosts: {type: 'number', name: 'other costs', group: 'general'},
  otherCostsText: {type: 'string', name: 'costs reason', group: 'general'},
};

const ItemSchema = {
  item: {
    type: Schema.Types.ObjectId,
    refPath: 'itemType'
  },
  itemType: {
    type: String,
    enum: ['Carrier', 'Art'],
    required: true
  },
  price: Number,
  quality: {
    type: String,
    enum: ['min', 'low', 'medium', 'high', 'max']
  }
};

const DistributionSchema = {
  locationId: String,
  _fields: [FieldSchema],
  items: [ItemSchema]
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

/**
 * store an object in the field definition
 * @param data
 */
DistributionModel.methods.objectSet = function(data) {
  return FlexModel.objectSet(this, FieldMap, data);
};

/**
 * create an object from the stored record
 *
 * @param fieldNames Array optional list of fields to store
 * @return {{}}
 */
DistributionModel.methods.objectGet = function(fieldNames = []) {
  return FlexModel.objectGet(this, FieldMap, fieldNames);
};

/**
 * the search is  {yearFrom: '1999'}
 * should become: {'_fields.string' : '1999', '_fields.def' : 'yearFrom'}
 */

DistributionModel.statics.findField = function(search = {}) {
  let qry = {};
  for (let key in search) {
    if (!search.hasOwnProperty(key)) { continue }
    qry['_fields.' + FieldMap[key].type] = search[key];
    qry['_fields.def'] = key;
  }
  let  f= this.find(qry);
  return this.find(qry);
};

module.exports = Mongoose.Model('Distribution', DistributionModel);
