/**
 * Group access to the API
 *
 *  version 0.0.2 202-03-14 _jay_
 */
const DbMongo = require('../lib/db-mongo');
const Schema = DbMongo.Schema;
const FlexSchema = require('./flex-model-helper').FieldSchema;
const FlexModel = require('./flex-model-helper');



const FieldMap = {
  guid: {type: 'string', name: 'guid', group: 'general'},
  groupId: {type: 'number', name: 'group id', group: 'not used'},
  parentId: {type: 'number', name: 'parent id', group: 'not used'},
  baseGroupId: {type: 'number', name: 'base group id', group: 'not used'},
  useCodeId: {type: 'number', name: 'use code', group: 'related'},
  typeId: {type: 'number', name: 'type id', group: 'not used'},
  fieldTypeId: {type: 'number', name: 'field type id', group: 'not used'},
  text: {type: 'string', name: 'text', group: 'general'},
  textNl: {type: 'string', name: 'text nl', group: 'general'},
  isDefault: {type: 'boolean', name: 'is default', group: 'general'},
  description: {type: 'string', name: 'description', group: 'general'},
  descriptionNl: {type: 'string', name: 'description nl', group: 'general'},
  short: {type: 'string', name: 'short', group: 'general'},
  groupOn: {type: 'string', name: 'group on', group: 'general'},
  sortOn: {type: 'string', name: 'sort on', group: 'general'},
  sortOnNl: {type: 'string', name: 'sort on nl', group: 'general'},
  notUsed: {type: 'boolean', name: 'not used', group: 'general'},
};

const CodeSchema = {
  codeId: Number,  // the id in WatsNext
  _fields: [FlexSchema],
  parent: {
    type: Schema.ObjectId,
    def: 'Code'
  }
};


let CodeModel = new Schema(CodeSchema);

CodeModel.statics.create = function(data) {
  return FlexModel.create('Code', data);
};

CodeModel.statics.relations = function() {
  return {
    '/parent': FieldMap,
  }
};
/**
 * store an object in the field definition
 * @param data
 */
CodeModel.methods.objectSet = function(data) {
  return FlexModel.objectSet(this, FieldMap, data);
};

/**
 * create an object from the stored record
 *
 * @param fieldNames Array optional list of fields to store
 * @return {{}}
 */
CodeModel.methods.objectGet = function(fieldNames = []) {
  return FlexModel.objectGet(this, FieldMap, fieldNames);
};

module.exports = DbMongo.Model('Code', CodeModel);
module.exports.FieldMap = FieldMap;
