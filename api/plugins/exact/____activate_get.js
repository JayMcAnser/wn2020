/**
 * Validate the connection to the sql server for access
 *
 * JvK 31-08-2019
 *
 */
const ErrorType = require('error-types');
const Logging = require('../../lib/logging');
const exact = require('../../exact').exact;


module.exports = getRoute = {
  method: 'GET',
  path: '/activate',
  config: {
    auth: false,
  },
  handler: async function(request, h) {
    try {
      if (await exact.createAccessToken()) {
        return {
          message: 'please restart the server to active the new token'
        }
      } else {
        return {
          error: 'no connection was made. see error log'
        }
      }
    } catch (err) {
      return ErrorType.toBoomError(err, request);
    }
  },
};
