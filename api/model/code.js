/**
 * Group access to the API
 *
 *  version 0.0.2 202-03-14 _jay_
 */
const DbMongo = require('../lib/db-mongo');
const Schema = DbMongo.Schema;


const CodeSchema = {
  codeId: Number,  // the id in WatsNext
  guid: String,
  text: String,
  parent: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'Code'
  },
  // if true code is root code for the alias system and can be included every where
  isGlobal: Boolean,
  onModel: {
    type: String,
    enum: ['Art', 'Carrier', 'Documentation']
  },
};

let CodeModel = new Schema(CodeSchema);

CodeModel.statics.create = function(data) {
  let typeClass = DbMongo.Model('Code');
  let rec = new typeClass(data);
  return rec
};

module.exports = DbMongo.Model('Code', CodeModel);
