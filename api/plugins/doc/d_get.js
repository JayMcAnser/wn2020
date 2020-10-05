/**
 * Get file direct
 *
 * JvK 26-08-2019
 *
 */
const Joi = require('@hapi/joi');
const ErrorType = require('error-types');
const Path = require('path');
const MimeTypes = require('mime-types');
const fs = require('fs');

const getRoute = {
  method: 'GET',
  options: {
    auth: false
  },
  path: '/d/{param*}',

  handler: async function(request, h) {
    try {
      let fileName = request.params.param;
      if (!fileName) {
        throw new ErrorType.ErrorNotFound();
      }
      let path = Path.join(__dirname, '/documentation', fileName);
      if (fs.existsSync(path)) {
        let source = fs.readFileSync(path);
        let mime = MimeTypes.lookup(fileName);
        let response = h.response(source);
        response.type(mime);
        return response
      }
      throw new ErrorType.ErrorNotFound()
    } catch (err) {
      return ErrorType.toBoomError(err, request);
    }
  },
};


module.exports = getRoute;
