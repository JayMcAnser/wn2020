/**
 * Group access to the API
 *
 *  version 0.0.2 202-03-14 _jay_
 */
const DbMongo = require('../lib/db-mongo');
const Schema = DbMongo.Schema;
const Config = require('config');
const ErrorType = require('error-types');
const User = require('./user');

let l = {
  part: 'distribution',
  work: 'vaud',    // view add update delete
  address: 'crud',  //
  financial: 'r'
};

const RightsSchema = {
  part: String,
  rights: String,
  dirty: false,
};

const GroupSchema = {
  name: {
    type: String,
    trim: true,
    min: [5, 'name must be atleast 5 characters'],
    required: [true, 'name is required'],
  },
  rights: [
    RightsSchema
  ],
  users: [
    { type: Schema.Types.ObjectId, ref: 'User'}
  ]
};

let GroupModel = new Schema(GroupSchema);
GroupModel.statics.get = function(id) {
  return this.findById(id);
};

GroupModel.methods.userAdd = function (user) {
  this.users.push(user);
};



/**
 * rights: Object
 *    groupId: String possible id of the group for duplicate checking
 *    part: string
 *    canAdd: bool
 *    canWrite: bool
 *    canView: bool
 *    canDelete: bool
 *
 */
GroupModel.methods.rightsAdd = function(part, rights) {
  let index = this.rights.findIndex(r => r.part === part);
  if (index >=0 ) {
    if (rights === this.rights[index].rights) {
      // nothing changed so no update
      return;
    }
    this.rights.pull(this.rights[index]._id)
  }
  let rString = '';
  if (typeof rights !== 'string') {
    rString = '';
    if (rights.canAdd) {
      rString += 'a'
    }
    if (rights.canDelete) {
      rString += 'd'
    }
    if (rights.canUpdate) {
      rString += 'u'
    }
    if (rights.canView) {
      rString += 'v'
    }
  } else {
    rString = rights;
  }
  this.rights.push({part: part, rights: rString, dirty : true});

};

GroupModel.methods.saveRights = async function() {
  for (let rIndex = 0; rIndex < this.rights.length; rIndex++) {
    if (this.rights[rIndex].dirty) {
      for (let uIndex = 0; uIndex < this.users.length; uIndex++) {
        let usr = await User.get(this.users[uIndex]);
        if (usr) {
          usr.rightsAdd(this.rights[rIndex].part, this.rights[rIndex].rights, this._id);
          await usr.save();
        }
      }
      this.rights[rIndex].dirty = false;
    }
  }
  return this.save();
};




module.exports = DbMongo.Model('Group', GroupModel);
