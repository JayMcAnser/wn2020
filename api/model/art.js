/**
 * A  art model
 * v: 0.2 2020-05-06
 *
 * Agent rules:
 *   - agentAdd(agent | data.agent), agentUpdate(index | ObjectId, data), agentRemove(index| ObjectId)
 *   - unique
 *     * the agent must be unique. If duplicate is created the new one replaces the old one
 *
 *   - creator
 *     * only one agent can be creator
 *     * if none is creator, index=0 is primary if not ROLE_SUBJECT
 *     * if more then 1 primary, latest creator set will become creator
 *     * creatorAgent is a virtual into the agent array
 *
 *  - royalties
 *     * total is always 100 (%)
 *     * 100 - (the sum of the not primary) is the royalties for the primary
 *     * if primary.royalties < 0 throw an error and no save
 *     * can be set in one call by setRoyalties[{_id, royaltiesPerc}, {_id, royaltiesPerc}] where primary can be missing
 *     * royaltiesValid checkes if all percentages are ok
 *
 */
const Mongoose = require('../lib/db-mongo');
const Schema = Mongoose.Schema;
const ErrorTypes = require('error-types');
const UndoHelper = require('mongoose-undo');
const Logging = require('../lib/logging');
const ROLE_CREATOR = 'creator';
const ROLE_CONTRIBUTOR = 'contributor';
const ROLE_SUBJECT = 'sublect';


const ArtistSchema = new Schema({
  agent: {
    type: Schema.ObjectId,
    ref: 'Agent'
  },
  role: String,
  percentage: Number,
  comments: String
});

const ArtLayout = {
  artId: String,
  type: String,
  searchcode:  String,
  title: String,
  titleEn: String,
  comments: String,
  sortOn: String,
  isPartOfCollection: Boolean,
  yearFrom: String,
  yearTill: String,
  // period: {
  //   type: 'string', name: 'period', group: 'general', getValue: (rec) => {
  //     let s = `${rec.yearFrom ? rec.yearFrom : ''}${rec.yearFrom !== undefined && rec.yearTill !== undefined ? ' - ' : ''}${rec.yearTill ? rec.yearTill : ''}`
  //     return s.length ? s : undefined
  //   }
  // },
  length: String,
  descriptionNl: String,
  description: String,
  hasSound: Boolean,
  audio: String,
  credits: String,

  playback: String,
  monitors: String,
  projectors: String,
  amplifierSpeaker: String,
  installation: Boolean,
  monitor: Boolean,
  projection: Boolean,
  carriers: String,
  objects: String,
  royaltiesError: String,

  // artist: {type: 'string', name: 'artist', group: 'general',
  //   getValue: (rec) => {
  //     if (rec.agents && rec.agents.length) {
  //       for (let l = 0; l < rec.agents.length; l++) {
  //         if (rec.agents[l].role === ROLE_CREATOR) {
  //           return rec.agents[l].artist;
  //         }
  //       }
  //       return rec.agents[0].artist;
  //     }
  //     return undefined
  //   },
  //   setValue: () => undefined
  // },

  //
  // owner: {type: 'address', name: 'owner', group: 'testing'},
  // also: {type: 'related', model: 'Contact', name: 'also', group: 'testing'},

  codes: [{
    type: Schema.ObjectId,
    ref: 'Code'
  }],
  agents: [ArtistSchema],
  urls: [String],
  created: UndoHelper.createSchema
};

let ArtSchema = new Schema(ArtLayout);

ArtSchema.plugin(UndoHelper.plugin);


ArtSchema.virtual('creatorIndex')
  .get(function() {
    if (this.agents.length === 0) {
      return -1
    } else {
      return this.agents.findIndex( (x) => x.role === ROLE_CREATOR);
    }
  });



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

/**
 * find an agent in the array.
 * @param agentId ObjectId
 * @return {boolean|number} the index or false
 * @private
 */
ArtSchema.methods._indexOfAgent = function(agentId) {
  if (this._agents && this._agents.length) {
    for (let l = 0; l < this._agents.length; l++) {
      if (agentId.toString() === this._agents._id.toString()) {
        return l;
      }
    }
  }
  return false;
}

/**
 * forces that there is alway one and only one creator
 * @param index
 * @param isCreator
 * @private
 */
ArtSchema.methods._setCreator = function(index, isCreator) {
  let didDefine = false;
  for (let l = 0; l < this.agents.length; l++) {
    if (this.agents[l].role === ROLE_CREATOR && l !== index && isCreator) {
      // reset the current creator because we have a new one
      if (this.agents[l].role === ROLE_CREATOR) {
        this.agents[l].percentage = 0;
      }
      this.agents[l].role = ROLE_CONTRIBUTOR;
    } else if(l === index && isCreator || this.agents[l].role === ROLE_CREATOR) {
      // we have a create defined
      didDefine = true;
    }
  }
  if (!didDefine && this.agents.length) {
    this.agents[0].role = ROLE_CREATOR;
  }
}

/**
 * set the royalties for the primary artist depending on the percentage the other ar getting
 * @param data Array of { _id, royalties}
 */
ArtSchema.methods.setRoyalties = function(data) {
  let creatorIndex = false;
  let perc = 0;
  let agentIndex;

  for (let l = 0; l < data.length; l++) {
    agentIndex = this.agents.findIndex( (a) => a._id.toString() === data[l]._id.toString());
    if (agentIndex >= 0) {
      if (this.agents[agentIndex].role === ROLE_CREATOR) {
        creatorIndex = agentIndex
      } else {
        perc += this.agents[agentIndex].percentage;
      }
    } else {
      Logging.warn(`art.id ${this._id.toString()}: the _id ${data[l]._id.toString()} was not found in the agents array.`);
    }
  }
  if (perc < 0 || perc > 100) {
    throw new ErrorTypes.ErrorFieldNotValid(`the total of the royalties percentages (${perc}%) is more the 100%`, false);
  } else if (creatorIndex === false) {
    creatorIndex = this.agents.findIndex((a) => a.role === ROLE_CREATOR)
  }
  if (creatorIndex === false) {
    Logging.error(`no creator found in ${this._id.toString()}`)
  } else {
    this.agents[creatorIndex].percentage = 100 - perc;
  }
}

/**
 * add an agent to this art.
 * @param data Agent or data rec
 */
ArtSchema.methods.agentAdd = function(data) {
  let dataRec;
  if (data.agent) {
    dataRec = data;
  } else {
    dataRec = {agent: data._id}
  }
  let index = this._indexOfAgent(dataRec.agent._id);
  if (index !== false) {
    // it's an update because we replace the agent
    this.agentUpdate(index, dataRec);
  } else {
    if (!dataRec.role) {
      dataRec.role = this.agents.length ? ROLE_CONTRIBUTOR : ROLE_CREATOR;
    }
    index = this.agents.length;
    this.agents.push(dataRec);
    this._setCreator(index, data.role === ROLE_CREATOR)
    this.setRoyalties(this.agents);
  }
};

/**
 * update an agent record
 *
 * @param id ObjectId / number / data record
 * @param data Object
 */
ArtSchema.methods.agentUpdate = function(id, data) {
  if (data === undefined) {
    data = id;
    id = data._id;
  }
  let index;
  if (typeof id === 'object') {
    index = this.agents.findIndex( (x) => x._id.toString() === id.toString())
  } else {
    index = id;
  }
  if (index >= 0 && index < this.agents.length) {
    Object.assign(this.agents[index], data);
    this._setCreator(index, this.agents[index].role === ROLE_CREATOR);
    this.setRoyalties(this.agents);
  } else {
    throw new ErrorTypes.ErrorDocumentNotFound(`art.agent: ${id.toString()} not found`);
  }
};

/**
 * remove agent from the list
 *
 * @param id: ObjectId | Number
 */

ArtSchema.methods.agentRemove = function(id) {
  let index;
  if (typeof id === 'object') {
    index = this.agents.findIndex( (x) => x._id.toString() === id.toString())
  } else {
    index = id;
  }
  if (index >= 0 && index < this.agents.length) {
    this.agents.splice(index, 1);
    this._setCreator(-1, false);
    this.setRoyalties(this.agents);
  } else {
    throw new ErrorTypes.ErrorDocumentNotFound(`art.agent: ${id.toString()} not found`);
  }
}

module.exports = Mongoose.Model('Art', ArtSchema);
module.exports.ROLE_CREATOR = ROLE_CREATOR;
module.exports.ROLE_CONTRIBUTOR = ROLE_CONTRIBUTOR;
module.exports.ROLE_SUBJECT = ROLE_SUBJECT;
