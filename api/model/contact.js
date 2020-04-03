/**
 * A flexable contact model where the field can be define on-the-fly
 *
 */
const Mongoose = require('../lib/db-mongo');
const Schema = Mongoose.Schema;
const FlexModel = require('./flex-model-helper');
const ErrorTypes = require('error-types');
const FieldSchema = require('./flex-model-helper').FieldSchema;
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

const AddressMap = {
  isDefault: {type: 'boolean', name: 'default', group:'general'},
  street: {type: 'string', name: 'street', group: 'general'},
  number: {type: 'string', name: 'number', group: 'general'},
  zipcode: {type: 'string', name: 'zipcode', group: 'general'},
  city: {type: 'string', name: 'city', group: 'general'},
  state: {type: 'string', name: 'state', group: 'general'},
  country: {type: 'string', name: 'country', group: 'general'},
};


const AddressSchema = {
  usage: String,
  _fields: [FieldSchema]
};

const ContactSchema = {
  addressId: String,
  _fields: [FieldSchema],
  addresses: [AddressSchema],
};

let ContactModel = new Schema(ContactSchema);

// ContactModel.pre('findOne', function(error, doc, next) {
// //  console.log('addr.found', this._conditions)
//   // next();
// })
/**
 * create a new ArtFlex.
 * Record fields can not be stored!
 * @param fields
 * @return {Promise|void|*}
 */
ContactModel.statics.create = function(fields) {
  return FlexModel.create('Contact', fields)
};



ContactModel.statics.relations = function() {
  return {
    '/': FieldMap,
    '/addresses': AddressMap,
  }
};
/**
 * store an object in the field definition
 * @param data
 */
ContactModel.methods.objectSet = function(data) {
  return FlexModel.objectSet(this, FieldMap, data);
};

/**
 * create an object from the stored record
 *
 * @param fieldNames Array optional list of fields to store
 * @return {{}}
 */
ContactModel.methods.objectGet = function(fieldNames = []) {
  return FlexModel.objectGet(this, FieldMap, fieldNames);
};

/**
 * the search is  {yearFrom: '1999'}
 * should become: {'_fields.string' : '1999', '_fields.def' : 'yearFrom'}
 */

ContactModel.statics.findField = function(search = {}) {
  let qry = {};
  for (let key in search) {
    if (!search.hasOwnProperty(key)) { continue }
    qry['_fields.' + FieldMap[key].type] = search[key];
    qry['_fields.def'] = key;
  }
  let  f= this.find(qry);
  return this.find(qry);
};

ContactModel.methods.addressAdd = function(data) {
  let dataRec = {_fields: []};
  FlexModel.objectSet(dataRec, AddressMap, data);
  this.addresses.push(dataRec);
};

ContactModel.methods.addressUpdate = function(index, itemData = false) {
  let ind = index;
  if (typeof index !== 'number') {
    for (ind = 0; ind < this.addresses.length; ind++) {
      if (index.toString() === this.addresses[ind]._id.toString()) {
        break;
      }
    }
  }
  if (ind < this.addresses.length) {
    if (itemData === false || Object.keys(itemData).length === 0) {
      this.addresses.splice(ind, 1);
    } else {
      FlexModel.objectSet(this.addresses[ind], AddressMap, itemData);
    }
    this.markModified('addresses');
  } else {
    throw new ErrorTypes.ErrorNotFound('address not found');
  }
};

module.exports = Mongoose.Model('Contact', ContactModel);

