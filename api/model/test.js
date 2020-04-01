/**
 * A flex Test model where the field can be define on-the-fly
 *
 */
const Mongoose = require('../lib/db-mongo');
const Schema = Mongoose.Schema;
const FlexModel = require('./flex-model-helper');
const FieldSchema = require('./flex-model-helper').FieldSchema;
const CodeFieldMap = require('./code').ShortFieldMap;

/**
 * the fields of the main record
 */
const TestFieldMap = {
  type: {type: 'string', name: 'code', group: 'general'},
  locationNumber: {type: 'string', name: 'location number', group: 'general'},
  //relTest:{ type: related, model: 'Test', name: 'relation test', group: 'general'}
  getValue: {type: 'string', name: 'getValue', group: 'calculated', getValue: (rec, mongoRec) => {
    return `${rec.type} is set`
  }},
  setValue: {type: 'string', name: 'setValue', group: 'calculated', setValue: (value, rec) => {
    return `the value was ${value}`;
  }},
  toggleRemove: {type: 'string', name: 'do remove', group: 'calculated', setValue: (value, rec) => {
    if (value ) {
      return value
    }
    return undefined
  }}
};

/**
 * The field in the Test => Test relation
 * used in Test.flexArray for field definition
 *
 */
const ExternFlexMap = {
  name: {type: 'string', name: 'name', group: 'general'}
};

const ExternSchema = {
  title: String,
  related:{
    type: Schema.Types.ObjectId,
    ref: 'Test'
  },
};
const ExternFlexSchema = {
  title: String,
  related:{
    type: Schema.Types.ObjectId,
    ref: 'Test'
  },
  _fields: [FieldSchema]
};

const CodeSchema = {
  code: {
    type: Schema.Types.ObjectId,
    ref: 'Code'
  }
};
/**
 * carrier record
 */
const TestSchema = {
  testId: String,
  name: String,
  _fields: [FieldSchema],   // the variable fields

  // direct link to an other Table
  baseRef: {
    type: Schema.Types.ObjectId,
    ref: 'Test'
  },
  baseSchema: ExternSchema,
  flexSchema: ExternFlexSchema,
  flexArray: [ExternFlexSchema],

  codeArray: [{
    type: Schema.ObjectId,
    ref: 'Code'
  }]
};

let TestModel = new Schema(TestSchema);

/**
 * create a new ArtFlex.
 * Record fields can not be stored!
 * @param fields
 * @return {Promise|void|*}
 */
TestModel.statics.create = function(fields) {
  return FlexModel.create('Test', fields)
};


TestModel.statics.relations = function() {
  return {
    '/' : TestFieldMap,
    '/codeArray': CodeFieldMap,
    '/flexArray': ExternFlexMap,
    '/flexArray/related': TestFieldMap
  }
};
/**
 * store an object in the field definition
 * @param data
 */
TestModel.methods.objectSet = function(data) {
  return FlexModel.objectSet(this, TestFieldMap, data);
};

/**
 * create an object from the stored record
 *
 * @param fieldNames Array optional list of fields to store
 * @return {{}}
 */
TestModel.methods.objectGet = function(fieldNames = []) {
  return FlexModel.objectGet(this, TestFieldMap, fieldNames);
};

/**
 * the search is  {yearFrom: '1999'}
 * should become: {'_fields.string' : '1999', '_fields.def' : 'yearFrom'}
 */

TestModel.statics.findField = function(search = {}) {
  let qry = {};
  for (let key in search) {
    if (!search.hasOwnProperty(key)) { continue }
    qry['_fields.' + FieldMap[key].type] = search[key];
    qry['_fields.def'] = key;
  }
  let  f= this.find(qry);
  return this.find(qry);
};

TestModel.methods.flexAdd = function(data) {
  let dataRec = {_fields: []};
  FlexModel.objectSet(dataRec, ExternFlexMap, data);

  this.flexArray.push(dataRec);
};


module.exports = Mongoose.Model('Test', TestModel);
module.exports.FieldMap = TestFieldMap;

