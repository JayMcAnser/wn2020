/**
 * Validate the connection to the sql server for access
 *
 * JvK 31-08-2019
 *
 */
const ErrorType = require('error-types');

module.exports = getRoute = {
  method: 'GET',
  path: '/',
  config: {
    auth: false
  },
  handler: async function(request, h) {
    try {
      return 'hi, do you want a newsletter?'
    } catch (err) {
      return ErrorType.toBoomError(err, request);
    }
  },
};
