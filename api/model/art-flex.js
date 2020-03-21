/**
 * A flexable art model where the field can be define on-the-fly
 *
 */
const Mongoose = require('../lib/db-mongo');
const Schema = Mongoose.Schema;
const FlexModel = require('./flex-model-helper');
const Address = require('./address');

/**
 * do NOT start a field with _. It will be skipped in the get
 * @type {{def: {type: StringConstructor, required: boolean}, text: StringConstructor}}
 */
const FieldMap = {
  type: {type: 'string', name: 'type', group: 'general'},
  title: {type: 'string', name: 'title', group: 'general'},
  titleEn: {type: 'string', name: 'titleEn', group: 'general'},
  comments: {type: 'string', name: 'comments', group: 'general'},
  sortOn: {type: 'string', name: 'sortOn', group: 'general'},
  isPartOfCollection: {type: 'boolean', name: 'isPartOfCollection', group: 'general'},
  yearFrom: {type: 'string', name: 'yearFrom', group: 'general'},
  yearTill: {type: 'string', name: 'yearTill', group: 'general'},
  period: {
    type: 'string', name: 'period', group: 'general', calc: (rec) => {
      let s = `${rec.yearFrom ? rec.yearFrom : ''}${rec.yearFrom !== undefined && rec.yearTill !== undefined ? ' - ' : ''}${rec.yearTill ? rec.yearTill : ''}`
      return s.length ? s : undefined
    }
  },

  length: {type: 'string', name: 'length', group: 'general'},
  description: {type: 'string', name: 'description', group: 'general'},
  hasSound: {type: 'boolean', name: 'hasSound', group: 'general'},
  audio: {type: 'string', name: 'audio', group: 'general'},
  credits: {type: 'string', name: 'credits', group: 'general'},

  playback: {type: 'string', name: 'playback', group: 'presentation'},
  monitors: {type: 'string', name: 'monitors', group: 'presentation'},
  projectors: {type: 'string', name: 'projectors', group: 'presentation'},
  amplifierSpeaker: {type: 'string', name: 'amplifier/speaker', group: 'presentation'},
  installation: {type: 'boolean', name: 'installation', group: 'presentation'},
  monitor: {type: 'boolean', name: 'monitor', group: 'presentation'},
  projection: {type: 'boolean', name: 'projection', group: 'presentation'},
  carriers: {type: 'string', name: 'carriers', group: 'presentation'},
  objects: {type: 'string', name: 'objects', group: 'presentation'},
};


const FieldSchema = {
  def: {  // the name in the FieldMap
    type: String,
    required: true
  },
  string: String,
  boolean: Boolean,
  number: Number,
  date: Date,
};

const AddressSchema = {
  addr: { type: Schema.Types.ObjectId, ref: 'Address' },
  number: Number,
  name: String
};
// AddressSchema.path('addressId',).rec('User');

const ArtFlexSchema = {
  artId: String,
  _fields: [FieldSchema],
  // work: { type: Schema.Types.ObjectId,ref: 'Address'}
  work: AddressSchema,
  multi: [AddressSchema]
  // address:[
  //   AddressSchema
  // ]
};

let ArtFlexModel = new Schema(ArtFlexSchema);

/**
 * create a new ArtFlex.
 * Record fields can not be stored!
 * @param fields
 * @return {Promise|void|*}
 */
ArtFlexModel.statics.create = function(fields) {
  let ArtFlex = Mongoose.Model('ArtFlex');
  let art = new ArtFlex({ _fields: []});
  art.objectSet(fields);
  return art.save();
};


/**
 * store an object in the field definition
 * @param data
 */
ArtFlexModel.methods.objectSet = function(data) {
  return FlexModel.objectSet(this, FieldMap, data);
};

/**
 * create an object from the stored record
 *
 * @param fieldNames Array optional list of fields to store
 * @return {{}}
 */
ArtFlexModel.methods.objectGet = function(fieldNames = []) {
  return FlexModel.objectGet(this, FieldMap, fieldNames);
};

/**
 * the search is  {yearFrom: '1999'}
 * should become: {'_fields.string' : '1999', '_fields.def' : 'yearFrom'}
 */

ArtFlexModel.statics.findField = function(search = {}) {
  let qry = {};
  for (let key in search) {
    if (!search.hasOwnProperty(key)) { continue }
    qry['_fields.' + FieldMap[key].type] = search[key];
    qry['_fields.def'] = key;
  }
  return this.find(qry);
};
module.exports = Mongoose.Model('ArtFlex', ArtFlexModel);
