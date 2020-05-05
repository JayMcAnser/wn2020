/**
 * Group access to the API
 *
 *  version 0.1.2 2020-04-28 _jay_
 */
const DbMongo = require('../lib/db-mongo');
const Schema = DbMongo.Schema;
// const FlexSchema = require('./flex-model-helper').FieldSchema;
// const FlexModel = require('./flex-model-helper');
const UndoHelper = require('mongoose-undo');
const _ = require('lodash');


const CodeSchema = {
  guid: {type: 'string', required: true},
  created: UndoHelper.createSchema,
  // the id on the old WatsNext
  codeId: {type: Number},
  groupId: {type: Number, default: 0},
  parent: {type: Schema.Types.ObjectId, def: 'Code'},
  baseGroupId: {type: Schema.Types.ObjectId},
  useCodeId: {type: Schema.Types.ObjectId},
  typeId: {type: Schema.Types.ObjectId},
  fieldTypeId: {type: 'number'},
  text: {type: String},
  textNl: {type: String},
  isDefault: {type: Boolean},
  description: {type: String},
  descriptionNl: {type: String},
  short: {type: String},
  groupOn: {type: String},
  sortOn: {type: String},
  sortOnNl: {type: String},
  notUsed: {type: Boolean},
}

let CodeModel = new Schema(CodeSchema);

CodeModel.plugin(UndoHelper.plugin);
module.exports = DbMongo.Model('Code', CodeModel);
