/**
 * translation table between the WatsNext, MongoDb and other address application
 */
const Mongoose = require('../lib/db-mongo');
const Schema = Mongoose.Schema;
const Config = require('config');
const DbMySQL = require('../lib/db-mysql');



const fieldMap = {
  departement: 'department',
  subName: 'sub_name',
  firstName: 'firstName',
  title: 'title',
  firstLetters: 'firstLetters',
  insertion: 'name_insertion',
  name : 'name',
  suffix: 'name_suffix',
  search : 'search',
  sortOn: 'sortOn',
};

const AddressSchema = {
  addressId: String, // the id in watsnext
  guid: String,      // for special addresses: DISTR_NOT_FOUND, ARTIST_NOT_FOUND
  typeId: Number,
  name: String,
  department: String,
  subName: String,
  firstName: String,
  title: String,
  firstLetter: String,
  insertion: String,
  suffix: String,
  search: String,
  sortOn: String,
};

let AddressModel = new Schema(AddressSchema);

_recordValue = function(rec, part) {
  let result;
  if (typeof part === 'string') {
    result = rec[part]
  } else {
    result = part(rec);
  }
  if (typeof result === 'string') {
    result = result.trim();
  }
  if (result !== null && result && result.length) {
    return result;
  }
  return undefined;
};
/**
 * does a lookup if the address is avaible. If not it creates an empty record with a new _id
 *
 * @param addressId
 */
AddressModel.statics.link = async function(addressId) {
  if (addressId) {
    let addr = await this.findOne({addressId: addressId});
    if (!addr) {
      let myCon = await DbMySQL.connect();
      let myAddr = await myCon.query('SELECT * FROM addresses WHERE address_ID=?', [addressId]);
      if (myAddr.length === 0) {
        addr = await this.findOne({guid: 'DISTR_NOT_FOUND'});
        if (!addr) {
          Logging.error(`the address.guid DISTR_NOT_FOUND does not exist. Must run Setup`);
          return undefined;
        }
      } else {
        addr = await this.create({addressId: addressId, isEmpty: false});
      }
      if (Config.get('Sync.pullAddress')) {
        if (myAddr.length) {
          for (let fieldName in fieldMap) {
            addr[fieldName] = _recordValue(myAddr[0], fieldMap[fieldName]);
          }
          addr = await addr.save();
        }
      }
    }
    return addr;
  }
  return undefined;
};


module.exports = Mongoose.Model('Address', AddressModel);
