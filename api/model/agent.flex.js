/**
 * A flexable agent model where the field can be define on-the-fly
 *
 */
const Mongoose = require('../lib/db-mongo');
const Schema = Mongoose.Schema;
const FlexModel = require('./flex-model-helper');
const FieldSchema = require('./flex-model-helper').FieldSchema;
const Contact = require('./contact');
const CodeFieldMap = require('./code').ShortFieldMap;
const _ = require('lodash');

/**
 * do NOT start a field with _. It will be skipped in the get
 */
const FieldMap = {
  type: {type: 'string', name: 'type', group: 'general'},
  searchcode: {type: 'string', name: 'searchcode', group: 'general'},
  contact: {type: 'related', model: 'Contact', name: 'contact', group: 'general', getValue: (rec, mongoRec) => {
      if (rec.contactRights === undefined) {
        rec.contactRights = _.cloneDeep(rec.contact);
      }
      if (rec.artistAddress === undefined) {
        rec.artistAddress = _.cloneDeep(rec.contact)
      }
      return this.contact;
    }},
  contactRights: {type: 'related', model: 'Contact', name: 'contact rights', group: 'general'},
  artistAddress: {type: 'related', model: 'Contact', name: 'artist address', group: 'general'},
  name: {type: 'string', name: 'type', group: 'general'},
  sortOn: {type: 'string', name: 'sort on', group: 'general'},
  died: {type: 'string', name: 'died', group: 'general'},
  biography: {type: 'string', name: 'biography', group: 'general'},
  biographyNl: {type: 'string', name: 'biography nl', group: 'general'},
  comments: {type: 'string', name: 'comments', group: 'general'},
  born: {type: 'string', name: 'born', group: 'general'},
  bornInCountry: {type: 'string', name: 'born in country', group: 'general'},
  customerNr: {type: 'string', name: 'customer number', group: 'finance'},
  percentage: {type: 'number', name: 'percentage', group: 'finance'}
};


const AgentModelSchema = {
  agentId: String,
  _fields: [FieldSchema],
  codes: [{
    type: Schema.ObjectId,
    ref: 'Code'
  }]
};

let AgentModel = new Schema(AgentModelSchema);

/**
 * create a new Agent
 * Record fields can not be stored!
 * @param fields
 * @return {Promise|void|*}
 */
AgentModel.statics.create = function(fields) {
  return FlexModel.create('Agent', fields)
};


AgentModel.statics.relations = function() {
  return {
    '/codes': CodeFieldMap
  }
};
/**
 * store an object in the field definition
 * @param data
 */
AgentModel.methods.objectSet = function(data) {
  return FlexModel.objectSet(this, FieldMap, data);
};

/**
 * create an object from the stored record
 *
 * @param fieldNames Array optional list of fields to store
 * @return {{}}
 */
AgentModel.methods.objectGet = function(fieldNames = []) {
  return FlexModel.objectGet(this, FieldMap, fieldNames);
};

/**
 * the search is  {yearFrom: '1999'}
 * should become: {'_fields.string' : '1999', '_fields.def' : 'yearFrom'}
 */

AgentModel.statics.findField = function(search = {}) {
  let qry = {};
  for (let key in search) {
    if (!search.hasOwnProperty(key)) { continue }
    qry['_fields.' + FieldMap[key].type] = search[key];
    qry['_fields.def'] = key;
  }
  let  f= this.find(qry);
  return this.find(qry);
};

module.exports = Mongoose.Model('Agent', AgentModel);
module.exports.FieldMap = FieldMap;
