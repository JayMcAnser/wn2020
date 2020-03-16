/**
 * Validate the connection to the sql server for access
 *
 * JvK 31-08-2019
 *
 */
const ErrorType = require('error-types');
const JsonFile = require('jsonfile');
const Path = require('path');

module.exports = getRoute = {
  method: 'GET',
  path: '/',
  config: {
    auth: false
  },
  handler: async function(request, h) {
    try {
      let data = JsonFile.readFileSync(Path.join(__dirname, '../../package.json'));
      // console.log(process.env);
      return {
        message: 'watsnext api 2',
        version: data.version,
        env: process.env.NODE_ENV ? 'no env' : process.env.NODE_ENV
      }
    } catch (err) {
      return ErrorType.toBoomError(err, request);
    }
  },
};
