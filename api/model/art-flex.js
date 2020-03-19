/**
 * A flexable art model where the field can be define on-the-fly
 *
 */
const Mongoose = require('../lib/db-mongo');
const Schema = Mongoose.Schema;

const FieldMap = {
  type: {type: 'string', name: 'type', group: 'general'},
  title: {type: 'string', name: 'title', group: 'general'},
  titleEn: {type: 'string', name: 'titleEn', group: 'general'},
  comments: {type: 'string', name: 'comments', group: 'general'},
  sortOn: {type: 'string', name: 'sortOn', group: 'general'},
  isPartOfCollection: {type: 'boolean', name: 'isPartOfCollection', group: 'general'},
  yearFrom: {type: 'string', name: 'yearFrom', group: 'general'},
  yearTill: {type: 'string', name: 'yearTill', group: 'general'},
  period: {type: 'string', name: 'period', group: 'general', calc: (rec) => {
    return `${rec.yearFrom ? rec.yearFrom : ''}${rec.yearFrom !== undefined && rec.yearTill !== undefined ? ' - ':''}${rec.yearTill ? rec.yearTill : ''}` }},
  length: {type: 'string', name: 'length', group: 'general'},
  description: {type: 'string', name: 'description', group: 'general'},
  hasSound: {type: 'boolean', name: 'hasSound', group: 'general'},
  audio: {type: 'string', name: 'audio', group: 'general'},
  credits: {type: 'string', name: 'credits', group: 'general'},

  playback: {type: 'string', name: 'playback', group: 'presentation'},
  monitors: {type: 'string', name: 'monitors', group: 'presentation'},
  projectors: {type: 'string', name: 'projectors', group: 'presentation'},
  amplifierSpeaker: {type: 'string', name: 'amplifierSpeaker', group: 'presentation'},
  installation: {type: 'boolean', name: 'installation', group: 'presentation'},
  monitor: {type: 'boolean', name: 'monitor', group: 'presentation'},
  projection: {type: 'boolean', name: 'projection', group: 'presentation'},
  carriers: {type: 'string', name: 'carriers', group: 'presentation'},
  objects: {type: 'string', name: 'objects', group: 'presentation'},
};

/**
 * do NOT start a field with _
 * @type {{def: {type: StringConstructor, required: boolean}, text: StringConstructor}}
 */
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

const ArtFlexSchema = {
  artId: String,
  _fields: [FieldSchema]
};

let ArtFlexModel = new Schema(ArtFlexSchema);

/**
 * create a new ArtFlex.
 * Record fields can not be stored!
 * @param fields
 * @return {Promise|void|*}
 */
ArtFlexModel.statics.create = function(fields, recFields = {}) {
  let ArtFlex = Mongoose.Model('ArtFlex');
  let art = new ArtFlex(recFields);
  art.objectSet(fields);
  return art.save();
};

ArtFlexModel.methods.asObject = function(fieldList = []) {
  if (fieldList.length === 0) {
    fieldList = Object.keys(FieldMap);
  }
  let result = this;
};

/**
 * store an object in the field definition
 * @param data
 */
ArtFlexModel.methods.objectSet = function(data) {
  let fieldIndexs = {};
  if (this._fields !== undefined) {
    for (let l = this._fields.length - 1; l >= 0;  l--) {
      let name = this._fields[l].def;
      if (data[name] === undefined) {
        if (data.hasOwnProperty(name) && FieldMap.hasOwnProperty(name)) {
          this._fields.splice(l, 1);  // remove data not available but prop exist
        }
      } else {
        fieldIndexs[name] = l; // remember index
      }
    }
  } else {
    this._fields = [];
  }
  for (let key in data) {
    if (!data.hasOwnProperty(key)) { continue }
    if (fieldIndexs[key] === undefined && FieldMap.hasOwnProperty(key)) {
      //this._fields.push({ def: key, text: data[key]})  // add the field
      this._fields.push({def: key, [FieldMap[key].type]: data[key]});
    } else if(FieldMap.hasOwnProperty(key)) {
      this._fields[fieldIndexs[key]][FieldMap[key].type] = data[key]; // update the field
    }
  }
};

/**
 * adds the calculated fields to the result data
 *
 * @param data
 * @param calcIndexes
 * @return Object
 * @private
 */
ArtFlexModel.methods._calcFields = function(data, calcIndexes = []) {
  for (let key in FieldMap) {
    if (!FieldMap.hasOwnProperty(key)) { continue }
    if (FieldMap[key].calc) {
      data[key] = FieldMap[key].calc(data, this)
    }
  }
  return data;
};

/**
 * create an object from the stored record
 *
 * @param fieldNames Array optional list of fields to store
 * @return {{}}
 */
ArtFlexModel.methods.objectGet = function(fieldNames = []) {
  if (this._fields === undefined || this._fields.length === 0) {
    return {};
  }
  let result = {};
  if  (fieldNames.length === 0) {
    for (let l = 0; l < this._fields.length; l++) {
      // result[this._fields[l].def] = this._fields[l].text;
      let name = this._fields[l].def;
      result[name] = this._fields[l][FieldMap[name].type];
    }
   result = this._calcFields(result);
  } else {
    for (let l = 0; l < this._fields.length; l++) {
      let name = this._fields[l].def;
      if (fieldNames.indexOf(name) >= 0) {
        result[name] = this._fields[l][FieldMap[name].type];//this._fields[l].text;
      }
    }
  }
  return result;
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
