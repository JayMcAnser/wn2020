/**
 * Validate the connection to the sql server for access
 *
 * JvK 202-04-08
 *
 */
const ErrorType = require('error-types');
const Logging = require('../../lib/logging');
const exact = require('../../exact').exact;


module.exports = getRoute = {
  method: 'GET',
  path: '/devision',
  config: {
    auth: false,
  },
  handler: async function(request, h) {
    try {
      return exact.devision()
    } catch (err) {
      return ErrorType.toBoomError(err, request);
    }
  },
};
