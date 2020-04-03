/**
 * A flexable art model where the field can be define on-the-fly
 *
 */
const Mongoose = require('../lib/db-mongo');
const Schema = Mongoose.Schema;
const FlexModel = require('./flex-model-helper');
const FieldSchema = require('./flex-model-helper').FieldSchema;
const Contact = require('./contact');
const CodeFieldMap = require('./code').ShortFieldMap;
const ArtistFieldMape = require('./agent').FieldMap;
const ErrorTypes = require('error-types');


const ROLE_CREATOR = 'creator';
const ROLE_CONTRIBUTOR = 'contributor';
const ROLE_SUBJECT = 'sublect';
/**
 * do NOT start a field with _. It will be skipped in the get
 * @type {{def: {type: StringConstructor, required: boolean}, text: StringConstructor}}
 */
const FieldMap = {
  type: {type: 'string', name: 'type', group: 'general'},
  searchcode: {type: 'string', name: 'searchcode', group: 'general'},
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
  descriptionNl: {type: 'string', name: 'description', group: 'general'},
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

  royaltiesError: {type: 'string', name: 'royalties error', group: 'errors'},

  artist: {type: 'string', name: 'artist', group: 'general',
    getValue: (rec) => {
      if (rec.agents && rec.agents.length) {
        for (let l = 0; l < rec.agents.length; l++) {
          if (rec.agents[l].role === ROLE_CREATOR) {
            return rec.agents[l].artist;
          }
        }
        return rec.agents[0].artist;
      }
      return undefined
    },
    setValue: () => undefined
  },

  //
  // owner: {type: 'address', name: 'owner', group: 'testing'},
  // also: {type: 'related', model: 'Contact', name: 'also', group: 'testing'},
};

const AgentFieldMap = {
  comments: {type: 'string', name: 'comments', group: 'general'},

};

const ArtistSchema = {
  artist: {
    type: Schema.ObjectId,
    ref: 'Agent'
  },
  role: String,
  percentage: Number,
  _fields: [FieldSchema],
};

const ArtModelSchema = {
  artId: String,
  _fields: [FieldSchema],
  codes: [{
    type: Schema.ObjectId,
    ref: 'Code'
  }],
  agents: [ArtistSchema]
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
    '/codes': CodeFieldMap,
    '/agents': AgentFieldMap,
    '/agents/artist': ArtistFieldMape,
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
 * takes care that only one artist is primary and that the
 * total of the percentage === 100
 *
 * @param vm
 * @param currentData
 * @private
 */
_artistPrimary = function(vm, currentData) {
  if (vm.agents.length === 0) {
    return;
  }
  if (currentData && currentData.artist) {
    let currentId = currentData.artist._id ? currentData.artist._id.toString() : currentData.artist;
    if (currentData.role === ROLE_CREATOR) {
      for (let l = 0; l < vm.agents.length; l++) {
        let artist = vm.agents[l];
        if (currentId !== artist.artist._id.toString()) {
          if (artist.role === ROLE_CREATOR) {
            artist.role = ROLE_CONTRIBUTOR;
            artist.percentage = 0;
            changed = true;
          } // else no change
        } // else no change
      }
    }
  }
  // calc percentage
  // the primary artist always get the rest. So giving a member 10% will lower the primary to 90%
  let perc = 0;
  let primIndex = 0;
  for (let l = 0; l < vm.agents.length; l++) {
    let artist = vm.agents[l];
    if (artist.role === ROLE_CREATOR) {
      primIndex = l;
    } else {
      perc += artist.percentage ? artist.percentage : 0;
    }
  }
  if (perc > 100) {
    vm._fields.push({def:'royaltiesError', string: 'royalties are more the 100%'});
  }
  vm.agents[primIndex].percentage = (100 - perc) + (vm.agents[primIndex].percentage ? vm.agents[primIndex].percentage : 0);

};

/**
 * find the index in the agents array by the index or by the _id
 *
 * @param vm
 * @param id
 * @private
 */
_agentIdToIndex = function(vm, id) {
  let ind = id;
  if (typeof id !== 'number') {
    for (ind = 0; ind < vm.agents.length; ind++) {
      if (id.toString() === vm.agents[ind]._id.toString()) {
        break;
      }
    }
  }
  return ind;
};

ArtModel.methods.agentAdd = function(data) {
  let dataRec = {_fields: []};
  this.objectSet({royaltiesError: undefined});
  FlexModel.objectSet(dataRec, AgentFieldMap, data);
  this.agents.push(dataRec);
  _artistPrimary(this, data);
};

ArtModel.methods.agentUpdate = function(id, data = false) {
  this.objectSet({royaltiesError: undefined});
  let ind = _agentIdToIndex(this, id);
  if (ind < this.agents.length) {
    if (Object.keys(data).length === 0) {
      this.agents.splice(ind, 1);
      _artistPrimary(this);
    } else {
      FlexModel.objectSet(this.agents[ind], AgentFieldMap, data);
      let dataObj = FlexModel.objectGet(this.agents[ind], AgentFieldMap);
      _artistPrimary(this, dataObj);
    }

  } else {
    throw new ErrorTypes.ErrorNotFound('agent index not found');
  }
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
module.exports.ROLE_CREATOR = ROLE_CREATOR;
module.exports.ROLE_CONTRIBUTOR = ROLE_CONTRIBUTOR;
module.exports.ROLE_SUBJECT = ROLE_SUBJECT;
