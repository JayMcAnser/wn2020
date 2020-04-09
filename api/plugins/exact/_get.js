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
  path: '/',
  config: {
    auth: false,
  },
  handler: async function(request, h) {
    try {
      if (request.query && request.query.code) {
        exact.code = request.query.code;
        if (await exact.createAccessToken()) {
          return {
            message: 'please restart the server to active the new token'
          }
        } else {
          return {
            error: 'no connection was made. see error log'
          }
        }
      } else {
        return {
          error: 'cissing code'
        }
      }
    } catch (err) {
      return ErrorType.toBoomError(err, request);
    }
  },
};
