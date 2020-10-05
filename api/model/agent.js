/**
 * A flexable agent model where the field can be define on-the-fly
 *
 */
const Mongoose = require('../lib/db-mongo');
const Schema = Mongoose.Schema;
const UndoHelper = require('mongoose-undo');
const ModelHelper = require('./model-helper');

const ContactSchema = new Schema({
  contact: {
    type: Schema.Types.ObjectId,
    ref: 'Contact'
  },
  isRights : Boolean,
  isContact: Boolean,
  isArtist: Boolean,
  percentage: Number,
})

const AgentLayout = {
  agentId: String,
  type: String,
  searchcode:  String,
  name: String,
  sortOn: String,
  died: String,
  biography: String,
  biographyNl: String,
  comments: String,
  born: String,
  bornInCountry: String,
  customerNr: String,
  percentage: {type: Number},
  contacts: [
    ContactSchema
  ],
  codes: [{
    type: Schema.ObjectId,
    ref: 'Code'
  }],
  royaltiesError: String,
};

let AgentSchema = new Schema(AgentLayout);
AgentSchema.plugin(UndoHelper.plugin);

AgentSchema.virtual('contact')
  .get(function() {
    if (this.contacts.length) {
      let index = this.contacts.findIndex( (a) => { return a.isContact})
      if (index < 0) {
        return this.contacts[0].contact
      }
      return this.contacts[index].contact
    }
    return undefined;
  })
AgentSchema.virtual('contactRights')
  .get(function() {
    if (this.contacts.length) {
      let index = this.contacts.findIndex( (a) => { return a.isRights})
      if (index < 0) {
        index = this.contacts.findIndex( (a) => { return a.isContact})
        if (index < 0) {
          return this.contacts[0].contact;
        }
      }
      return this.contacts[index].contact;
    }
    return undefined;
  })
AgentSchema.virtual('contactArtist')
  .get(function() {
    if (this.contacts.length) {
      let index = this.contacts.findIndex( (a) => { return a.isArtist})
      if (index < 0) {
        return this.contact[0].contact
      }
      return this.contacts[index].contact
    }
    return undefined;
  })


/**
 * add a contact to the contacts.
 * @param contact
 * @param usage String 'contact' | 'rights' | 'artist'
 */
AgentSchema.methods.contactAdd = function(contact, usage) {
  let index = this.contacts.findIndex( (a) => { return a.contact._id.toString() === contact._id.toString()})
  if (index < 0) {
    index = this.contacts.length;
    this.contacts.push({contact: contact})
  }
  this.contacts[index].isRights = usage && usage.indexOf('rights') >= 0;
  this.contacts[index].isArtist = usage && usage.indexOf('artist') >= 0;
  this.contacts[index].isContact = usage && usage.indexOf('contact') >= 0;
}

AgentSchema.methods.contactRemove = function(index) {
  if (typeof index === 'object') {
    index = this.contacts.findIndex( (a) => { return a.contact._id.toString() === contact._id.toString()})
  }
  if (index >= 0 && index < this.contacts.length) {
    this.contacts.splice(index, 1);
  }
}

AgentSchema.methods.codeAdd = function(code) {
  ModelHelper.addObjectId(this.codes, code);
  // let index = this.codes.findIndex( (x) => { return x._id.toString() === code._id.toString()});
  // if (index < 0) {
  //   this.codes.push(code);
  // }
}

/**
 * remove a code
 * @param index Number (the index, _id of the code, or the code with _id)
 */
AgentSchema.methods.codeRemove = function (index) {
  ModelHelper.removeObjectId(this.codes, index);
}

AgentSchema.methods.codeSet = function(codes) {
  ModelHelper.setObjectIds(this.codes, codes);
}

/**
 * validate the royalties definition storing the result in royaltiesError
 *
 * - rule: there should be atleast on contact
 * - rule: total of contact.percentage must be 100
 *
 * @return Boolean true if it valid
 */
AgentSchema.methods.royaltiesValidate = function() {
  let errors = [];
  if (this.contacts === undefined || this.contacts.length === 0) {
    errors.push('no contacts defined')
  } else {
    let perc = 0;
    for (let index = 0; index < this.contacts.length; index++) {
      perc += this.contacts[index].percentage
    }
    if (perc !== 100) {
      errors.push('total of percentage should be 100%')
    }
  }
  this.royaltiesError = errors.length ? errors.join('\n') : '';
  return errors.length === 0
}


module.exports = Mongoose.Model('Agent', AgentSchema);
