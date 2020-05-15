/**
 * Group access to the API
 *
 *  version 0.1.2 2020-04-28 _jay_
 *   0.2 _jay_ 2020-05-13
 */
const DbMongo = require('../lib/db-mongo');
const Schema = DbMongo.Schema;
const UndoHelper = require('mongoose-undo');
const _ = require('lodash');


const CodeSchema = {
  guid: {type: 'string', required: false},
  created: UndoHelper.createSchema,
  // the id on the old WatsNext
  codeId: {type: Number},
  groupId: {type: Number, default: 0},
  parentId: {type: Number, default: 0},
  parent: {type: Schema.Types.ObjectId, ref: 'Code'},
  baseGroupId: {type: Number, default: 0},
  baseGroup: {type: Schema.Types.ObjectId, ref:'Code'},
  useCodeId: {type: Number, default: 0},
  useCode: {type: Schema.Types.ObjectId, ref: 'Code'},
  typeId: {type: Number, default: 0},
  type: {type: Schema.Types.ObjectId, ref: 'Code'},
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
