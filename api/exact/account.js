/**
 * exact account
 *
 * we can say:
 *    let acc = Account.create({name: 'Test Account'});
 *    await acc.save();
 *
 *    let ac2 = await Account.find({name: 'Test Account'});
 *    // or
 *    let ac3 = await Account.findById(acc.id)
 *    // we can use the let result = new Proxy(ac3) to set a captured value
 *    //https://stackoverflow.com/questions/2357618/is-there-such-a-thing-as-a-catch-all-key-for-a-javascript-object
 *    ac2.name = 'John Boldwin'
 *    await Account.save();
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
