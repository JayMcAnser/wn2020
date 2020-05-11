/**
 * A flexable contact model where the field can be define on-the-fly
 *
 */
const Mongoose = require('../lib/db-mongo');
const Schema = Mongoose.Schema;
const UndoHelper = require('mongoose-undo');
const ErrorTypes = require('error-types');
/**
 * do NOT start a field with _. It will be skipped in the get
 * @type {{def: {type: StringConstructor, required: boolean}, text: StringConstructor}}
 */
const FieldMap = {
  type: {type: 'string', name: 'type', group: 'general'},
  guid: {type: 'string', name: 'guid', group: 'general'},
  department: {type: 'string', name: 'department', group: 'general'},
  parent: {type: 'related', onModel: 'Contact', name: 'company', group: 'general'},
  subName: {type: 'string', name: 'sub name', group: 'general'},
  firstName: {type: 'string', name: 'first name', group: 'general'},
  firstLetters: {type: 'string', name: 'first letters', group: 'general'},
  title: {type: 'string', name: 'title', group: 'general'},
  insertion: {type: 'string', name: 'insertion', group: 'general'},
  name: {type: 'string', name: 'name', group: 'general'},
  suffix: {type: 'string', name: 'suffix', group: 'general'},
  search: {type: 'string', name: 'search', group: 'general'},
  sortOn: {type: 'string', name: 'sortOn', group: 'general'},
  mailchimpJson: {type: 'string', name: 'mailchimp json', group: 'mailchimp'},
  mailchimpGuid: {type: 'string', name: 'mailchimp guid', group: 'mailchimp'},

  workAddress: {type: 'string', name: 'work address', group:'address',
    setValue: () => undefined,
    getValue: (rec, mongoRec) => {
      if (rec.addresses && rec.addresses.length) {
        let def = undefined;
        for (let l = 0; l < rec.addresses.length; l++) {
          if (rec.addresses[l].usage === 'work') {
            return rec.addresses[l]
          } else if (rec.addresses[l].isDefault) {
            def = rec.addresses[l]
          }
        }
        if (def) {
          return def;
        } else {
          return rec.addresses[0]
        }
      } else {
        return undefined;
      }
    }
  }
};

const LocationSchema = {
  usage: String,
  isDefault: Boolean,
  street: String,
  number: String,
  suffix: String,
  zipcode: String,
  city: String,
  state: String,
  country: String,
};

const ContactLayout = {
  addressId: String,
  type: String,
  guid: String,
  department: String,
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Contact'
  },
  subName: String,
  firstName: String,
  firstLetters: String,
  title: String,
  insertion: String,
  name: String,
  suffix: String,
  search: String,
  sortOn: String,
  mailchimpJson: String,
  mailchimpGuid: String,

  // workAddress: {type: 'string', name: 'work address', group:'address',
  //   setValue: () => undefined,
  //   getValue: (rec, mongoRec) => {
  //     if (rec.addresses && rec.addresses.length) {
  //       let def = undefined;
  //       for (let l = 0; l < rec.addresses.length; l++) {
  //         if (rec.addresses[l].usage === 'work') {
  //           return rec.addresses[l]
  //         } else if (rec.addresses[l].isDefault) {
  //           def = rec.addresses[l]
  //         }
  //       }
  //       if (def) {
  //         return def;
  //       } else {
  //         return rec.addresses[0]
  //       }
  //     } else {
  //       return undefined;
  //     }
  //   }
  // }
  location: [LocationSchema],
};

let ContactSchema = new Schema(ContactLayout);


ContactSchema.methods.locationAdd = function(data) {
  this.location.push(data);
};

ContactSchema.methods.locationUpdate = function(index, itemData = false) {
  let ind = index;
  if (typeof index !== 'number') {
    for (ind = 0; ind < this.location.length; ind++) {
      if (index.toString() === this.location[ind]._id.toString()) {
        break;
      }
    }
  }
  if (ind < this.location.length) {
    if (itemData === false || Object.keys(itemData).length === 0) {
      this.location.splice(ind, 1);
    } else {
      Object.assign(this.location[ind], itemData)
    }
    this.markModified('location');
  } else {
    throw new ErrorTypes.ErrorNotFound('address.location not found');
  }
};

ContactSchema.plugin(UndoHelper.plugin);
module.exports = Mongoose.Model('Contact', ContactSchema);

