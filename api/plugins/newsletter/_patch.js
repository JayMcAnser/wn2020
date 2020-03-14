/**
 * confirm the subscription to the newsletter
 */

const Logger = require('../../lib/logging');
const Joi = require('@hapi/joi');
const Db = require('../../model/db').db;
const validator = require("email-validator");

const newsletterConfirmRoute = {
  method: 'PATCH',
  path: '/{key}',
  handler: async function ( request, h) {
    try {
      let nws = Db.tables.Newsletter;

      switch (await nws.confirmSubscription(request.params.key)) {
        case -1:
          return {status: -1, message: 'key not found'}
        case 1:
          return {status: 1, message: 'confirmed'}
        case 2:
          return {status: 2, message: 'already confirmed'}
        default:
          return {status: -1, message: 'unknown error'}
      }
    } catch (e) {
      Logger.error(e.message, 'newsletter.confirm_gett');
      return { status: -1, message: e.message }
    }
  },
  options: {
    auth: false,
  }
};

module.exports = newsletterConfirmRoute;
