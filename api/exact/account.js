/**
 * exact account
 */
const Endpoint = require('./endpoint');



class Account extends Endpoint {

  constructor(options = {}) {
    super(Object.assign({}, options, { rootUrl: '/crm/Accounts'}));
  }

  addContact(info) {

  }

}
module.exports = Account;
