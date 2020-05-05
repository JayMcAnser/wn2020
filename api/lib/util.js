/**
 *
 */

const Mongoose = require('mongoose');


module.exports.QuerySession = function() {
  Mongoose.Query.prototype.session = function(session, aCallback) {
    console.log(this);
    // let query = this;
    // return query.run(aError, aDocs) {
    //   if (aError) {
    //
    //   }
    // }
    if (aCallback) {
      return aCallback(null);
    }
    return this;
  }
}
