/**
 * A flex carrier model where the field can be define on-the-fly
 *
 */
const Mongoose = require('../lib/db-mongo');
const Schema = Mongoose.Schema;
const FlexModel = require('./flex-model-helper');
const FieldSchema = require('./flex-model-helper').FieldSchema;
const ArtFieldMap = require('./art').FieldMap
/**
 * do NOT start a field with _. It will be skipped in the get
 * @type {{def: {type: StringConstructor, required: boolean}, text: StringConstructor}}
 */
const FieldMap = {
  type: {type: 'string', name: 'code', group: 'general'},
  locationNumber: {type: 'string', name: 'location number', group: 'general'},
  searchCode: {type: 'string', name: 'searchcode', group: 'general'},
  creationDate: {type: 'date', name: 'creation date', group: 'general'},
  mutationDate: {type: 'date', name: 'mutation date', group: 'general'},
  comments: {type: 'string', name: 'comments', group: 'general'},
  collectionNumber: {type: 'string', name: 'collection number', group: 'general'},
  technicalComments: {type: 'string', name: 'techniscal comments', group: 'general'},
  recommend: {type: 'string', name: 'recommend', group: 'general'},
  compressionRate: {type: 'string', name: 'compression rate', group: 'general'},
  conservationPhase: {type: 'number', name: 'conserveration phase', group: 'general'},
  aspectRatio: {type: 'string', name: 'aspect ratio', group: 'general'},
  fileName: {type: 'string', name: 'filename', group: 'file'},
  filePath: {type: 'string', name: 'file path', group: 'file'},
  fileLocationNumber: {type: 'string', name: 'location number', group: 'file'},
  videoCodec: {type: 'string', name: 'video codec', group: 'file'},
  size: {type: 'string', name: 'size', group: 'file'},
  muxRate: {type: 'string', name: 'mux rate', group: 'file'},
  fps: {type: 'string', name: 'fps', group: 'file'},
  audioCodec: {type: 'string', name: 'audio codec', group: 'file'},
  audioType: {type: 'string', name: 'audio type', group: 'file'},
  audioRate: {type: 'string', name: 'audio rate', group: 'file'},
  modifications: {type: 'string', name: 'modifications', group: 'file'},
  extension: {type: 'string', name: 'extension', group: 'file'},
  ltoTapeNumber: {type: 'string', name: 'lto tape number', group: 'lto'},
  ltoPositionNumber: {type: 'string', name: 'lto position number', group: 'lto'},
  ltoMd5: {type: 'string', name: 'lto md5', group: 'lto'},
  viewRating: {type: 'number', name:'view rating', group: 'website'},

  // new fields:
  noArt: {type: 'boolean', name: 'no art', group: 'statistics'}
};

const ArtRelationFieldMap = {
  // art: {type: 'related', model: 'Art', name: 'art', group: 'general'},
  startTime: { type: 'string', name: 'start time', group:'general'},
  endTime: {type: 'string', name: 'end time', group: 'general'},
  source: {type: 'string', name: 'source', group: 'general'},
  collectionNumber: {type: 'string', name: 'collection number', group: 'general'},
  locationNumber: {type: 'string', name: 'location number', group: 'general'},
  videoCorrection: {type: 'string', name: 'video correction', group: 'general'},
  audioCorrection: {type: 'string', name: 'audio correction', group: 'general'},
  technicalComments: {type: 'string', name: 'technical comments', group: 'general'},
  videoGain: {type: 'string', name: 'video gain', group: 'general'},
  videoBlack: {type: 'string', name: 'video black', group: 'general'},
  videoChroma: {type: 'string', name: 'video chroma', group: 'general'},
  audioLeft: {type: 'string', name: 'audio left', group: 'general'},
  audioRight: {type: 'string', name: 'saudio right', group: 'general'},
};

const ArtSchema = {
  art: {
    type: Schema.Types.ObjectId,
    ref: 'Art'
  },
  _fields:[FieldSchema],
  artCodes: [{
    type: Schema.ObjectId,
    ref: 'Code'
  }]
};

/**
 * carrier record
 */
const CarrierSchema = {
  carrierId: String,        // the org carrier id in WatsNext
  _fields: [FieldSchema],   // the variable fields
  artwork: [ArtSchema],     // the art in / on this carrier
  codes: [{
      type: Schema.ObjectId,
      ref: 'Code'
  }]
};

let CarrierModel = new Schema(CarrierSchema);

/**
 * create a new ArtFlex.
 * Record fields can not be stored!
 * @param fields
 * @return {Promise|void|*}
 */
CarrierModel.statics.create = function(fields) {
  return FlexModel.create('Carrier', fields)
};


CarrierModel.statics.relations = function() {
  return {
    '/codes': {},
    '/artwork': ArtRelationFieldMap,
    '/artwork/art': ArtFieldMap,
    '/artwork/artCodes': {}
  }
};
/**
 * store an object in the field definition
 * @param data
 */
CarrierModel.methods.objectSet = function(data) {
  return FlexModel.objectSet(this, FieldMap, data);
};

/**
 * create an object from the stored record
 *
 * @param fieldNames Array optional list of fields to store
 * @return {{}}
 */
CarrierModel.methods.objectGet = function(fieldNames = []) {
  return FlexModel.objectGet(this, FieldMap, fieldNames);
};

/**
 * the search is  {yearFrom: '1999'}
 * should become: {'_fields.string' : '1999', '_fields.def' : 'yearFrom'}
 */

CarrierModel.statics.findField = function(search = {}) {
  let qry = {};
  for (let key in search) {
    if (!search.hasOwnProperty(key)) { continue }
    qry['_fields.' + FieldMap[key].type] = search[key];
    qry['_fields.def'] = key;
  }
  let  f= this.find(qry);
  return this.find(qry);
};

CarrierModel.methods.artAdd = function(data) {
  let dataRec = {_fields: []};
  FlexModel.objectSet(dataRec, ArtRelationFieldMap, data)
  this.artwork.push(dataRec);
};


module.exports = Mongoose.Model('Carrier', CarrierModel);
module.exports.FieldMap = FieldMap;
module.exports.Art2CarrierMap = ArtFieldMap;
