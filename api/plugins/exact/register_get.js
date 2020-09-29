/**
 * return the url to call to register the api of exact.
 * Call will require an restart of the server !!!!!
 *
 * Jay 202-04-08
 *
 */
const ErrorType = require('error-types');
const Logging = require('../../lib/logging');
const exact = require('../../exact/exact-conection').exact;


module.exports = getRoute = {
  method: 'GET',
  path: '/register',
  config: {
    auth: false,
  },
  handler: async function(request, h) {
    return {
      url: exact.registerUrl(),
      message: 'please restart the server after calling the url'
    }
  },
};
