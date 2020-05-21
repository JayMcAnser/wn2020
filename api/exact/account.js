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
const Endpoint = require('./endpoint');
const ExactModel = require('./endpoint').Model;


class AccountRecord extends Endpoint {

  constructor(data, options = {}) {
    super(Object.assign({}, options, { rootUrl: '/crm/Accounts'}));
//    this.data = {};
  }



  /**
   * convert the internal structure to the exact structue
   * @param data
   */
  convertToExact(data) {
    return data
  }


}

/**
 *
 * Global definition of an account
 */
//
// const Account = Object.assign({}, ExactModel, {
//   newRecord(options) {
//     return new AccountRecord(options)
//   }
// })

class Account extends ExactModel {

  static create(data, options) {
    return new AccountRecord(data, options);
  }
}

module.exports = Account;
