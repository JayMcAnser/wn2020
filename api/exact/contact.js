/**
 * Exact Contact
 *
 * required
 *   - account
 * fields are in camelCase:
 *    https://start.exactonline.nl/docs/HlpRestAPIResourcesDetails.aspx?name=CRMContacts
 *
 */
const ExactRecord = require('./endpoint').Record;
const ExactModel = require('./endpoint').Model;
const URL = '/crm/Contacts';


class ContactRecord extends ExactRecord {
  constructor(data, options = {}) {
    super(data, Object.assign({}, options, { rootUrl: URL}));
  }
}

/**
 *
 * Global definition of an account
 */

class Contact extends ExactModel {
  static create(data, options) {
    return ExactModel.makeReactive(new ContactRecord(data, options))
  }

  static findById(id, options) {
    let rec = ExactModel.makeReactive(new ContactRecord());
    return rec.findById(id, options);
  }

  static find(query) {
    let rec = new ContactRecord();
    return rec.find(query).then( (recs) => {
      for (let l = 0; l < recs.length; l++) {
        recs[l] = ExactRecord.makeReactive(recs[l]);
      }
      return Promise.resolve(recs);
    })
  }
}

module.exports = Contact;
