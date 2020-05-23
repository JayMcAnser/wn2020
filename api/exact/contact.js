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
}

module.exports = Contact;
