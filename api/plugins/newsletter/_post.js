/**
 * request a new subscription to the newsletter
 * send a mail to the user to confirm
 *
 * payload: {
 *   email, name?, letter?
 * }
 * result: {
 *   status,
 *        - -1: invalid email address,
 *        -  0: internal error,
 *        -  1: did send mail,
 *        -  2: resend confirm,
 *        -  3: already did subscribed )
 *   message
 * }
 */
const Logger = require('../../lib/logging');
// const Logger = require('../../../src/services/logging');

const Joi = require('@hapi/joi');
const Db = require('../../model/db').db;
const validator = require("email-validator");

const newsletterRoute = {
  method: 'POST',
  path: '/',
  handler: async function ( request, h) {
    try {
      // email is required, but putting it in the payload validate makes a 'bad' error message
      if (!request.payload || !request.payload.email || !validator.validate(request.payload.email)) {
        return { status: -1, message: 'missing or bad email address' }
      }
      let nws = Db.tables.Newsletter;
      let list = request.payload.list ? request.payload.list : 'newsletter';

      let rec = await nws.findOne({ email: request.payload.email, list });
      let result =  { status: 2, message: 'resend invitation'};
      if (rec && rec.isConfirmed) {
        return { status: 3, message: 'you are already registered' }
      } else if (rec === false) {
        rec = {
          name: request.payload.name ? request.payload.name : (request.payload.lastName ? request.payload.lastName : request.payload.email),
          firstName: request.payload.firstName,
          lastName: request.payload.lastName,
          email: request.payload.email,
          list,
          isConfirmed: false
        }
        rec = await nws.add(rec);
        result = { status: 1, message: 'invitation send'}
      }
      await nws.sendRegisterMail(rec)
      return result;
    } catch (e) {
      Logger.error(e.message, 'newsletter._post');
      return { status: -1, message: e.message }
    }
  },
  options: {
    auth: false,
    validate: {
      payload: {
        name: Joi.string(),
        firstName: Joi.string(),
        lastName: Joi.string(),
        email: Joi.string(),
        list: Joi.string(),
      }
    },
  }
};

module.exports = newsletterRoute;
