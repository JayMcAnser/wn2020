/**
 * A flexable art model where the field can be define on-the-fly
 *
 */
const Mongoose = require('../lib/db-mongo');
const Schema = Mongoose.Schema;
const FlexModel = require('./flex-model-helper');
const FieldSchema = require('./flex-model-helper').FieldSchema;
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
    type: 'string', name: 'period', group: 'general', getValue: (rec) => {
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
  //
  // owner: {type: 'address', name: 'owner', group: 'testing'},
  // also: {type: 'related', model: 'Address', name: 'also', group: 'testing'},
};

//
// const AddressLink = {
//   type: Schema.Types.ObjectId,
//   ref: 'Address'
// };
// // const FieldSchema = {
// //   def: {  // the name in the FieldMap
// //     type: String,
// //     required: true
// //   },
// //   string: String,
// //   boolean: Boolean,
// //   number: Number,
// //   date: Date,
// //   related: {
// //     type: Schema.Types.ObjectId,
// //     // ref: 'Address'
// //     refPath: '_fields.onModel'
// //   },
// //   onModel: {
// //     type: String,
// //     enum: ['Address', 'Distribution']
// //   },
// //   address: AddressLink,
// // };
//
// const AddressSchema = {
//   addr: { type: Schema.Types.ObjectId, ref: 'Address' },
//   number: Number,
//   name: String
// };
// // AddressSchema.path('addressId',).rec('User');
//
const ArtModelSchema = {
  artId: String,
  _fields: [FieldSchema],
};

let ArtModel = new Schema(ArtModelSchema);

/**
 * create a new ArtFlex.
 * Record fields can not be stored!
 * @param fields
 * @return {Promise|void|*}
 */
ArtModel.statics.create = function(fields) {
  return FlexModel.create('Art', fields)
};


ArtModel.statics.relations = function() {
  return {
  }
};
/**
 * store an object in the field definition
 * @param data
 */
ArtModel.methods.objectSet = function(data) {
  return FlexModel.objectSet(this, FieldMap, data);
};

/**
 * create an object from the stored record
 *
 * @param fieldNames Array optional list of fields to store
 * @return {{}}
 */
ArtModel.methods.objectGet = function(fieldNames = []) {
  return FlexModel.objectGet(this, FieldMap, fieldNames);
};

/**
 * the search is  {yearFrom: '1999'}
 * should become: {'_fields.string' : '1999', '_fields.def' : 'yearFrom'}
 */

ArtModel.statics.findField = function(search = {}) {
  let qry = {};
  for (let key in search) {
    if (!search.hasOwnProperty(key)) { continue }
    qry['_fields.' + FieldMap[key].type] = search[key];
    qry['_fields.def'] = key;
  }
  let  f= this.find(qry);
  return this.find(qry);
};

module.exports = Mongoose.Model('Art', ArtModel);
module.exports.FieldMap = FieldMap;
