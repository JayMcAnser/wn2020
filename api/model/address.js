/**
 * A flexable art model where the field can be define on-the-fly
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
  guid: {type: 'string', name: 'guid', group: 'general'},
  department: {type: 'string', name: 'department', group: 'general'},
  subName: {type: 'string', name: 'sub name', group: 'general'},
  firstName: {type: 'string', name: 'first name', group: 'general'},
  title: {type: 'string', name: 'title', group: 'general'},
  insertion: {type: 'string', name: 'insertion', group: 'general'},
  name: {type: 'string', name: 'name', group: 'general'},
  suffix: {type: 'string', name: 'suffix', group: 'general'},
  search: {type: 'string', name: 'search', group: 'general'},
  sortOn: {type: 'string', name: 'sortOn', group: 'general'},
};

const DistributionContractSchema = {
  contract: {type: Schema.Types.ObjectId, def: 'Distribution'},
  info: String,
};
const AddressSchema = {
  addressId: String,
  _fields: [FieldSchema],
  contracts: [DistributionContractSchema]
};

let AddressModel = new Schema(AddressSchema);

// AddressModel.pre('findOne', function(error, doc, next) {
// //  console.log('addr.found', this._conditions)
//   // next();
// })
/**
 * create a new ArtFlex.
 * Record fields can not be stored!
 * @param fields
 * @return {Promise|void|*}
 */
AddressModel.statics.create = function(fields) {
  return FlexModel.create('Address', fields)
};

/**
 * store an object in the field definition
 * @param data
 */
AddressModel.methods.objectSet = function(data) {
  return FlexModel.objectSet(this, FieldMap, data);
};

/**
 * create an object from the stored record
 *
 * @param fieldNames Array optional list of fields to store
 * @return {{}}
 */
AddressModel.methods.objectGet = function(fieldNames = []) {
  return FlexModel.objectGet(this, FieldMap, fieldNames);
};

/**
 * the search is  {yearFrom: '1999'}
 * should become: {'_fields.string' : '1999', '_fields.def' : 'yearFrom'}
 */

AddressModel.statics.findField = function(search = {}) {
  let qry = {};
  for (let key in search) {
    if (!search.hasOwnProperty(key)) { continue }
    qry['_fields.' + FieldMap[key].type] = search[key];
    qry['_fields.def'] = key;
  }
  let  f= this.find(qry);
  return this.find(qry);
};

module.exports = Mongoose.Model('Address', AddressModel);

