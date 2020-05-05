/**
 * exact contact
 */
const Endpoint = require('./endpoint');
const Record = require('./exact-record');

class ContactRecord extends Record {

}


class Contact extends Endpoint {

  constructor(options = {}) {
    super(Object.assign({}, options, { rootUrl: '/crm/Contacts'}));
  }

  _createRec(options) {
    return new ContactRecord(options)
  }

}
module.exports = Contact;
