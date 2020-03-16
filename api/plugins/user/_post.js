/**
 * create a new user.
 * Create a view user without any rights
 */

const Joi = require('@hapi/joi');
const User = require('../../model/user');


/**
 * create a new user
 * @param username String
 * @param passwordHash String
 * @param email
 * @returns {
 *   username, email, token, refreshToken
 * }
 */
const userAdd = {
  method: 'POST',
  path: '/',
  handler: function ( request, h) {
    try {
      return User.create(request.payload).then( (user) => {
        return {
          id: user._id,
        };
      }).catch((e) => {
        return {
          error: [{ message: err.message, system: false} ]
        };
      });
    } catch(err) {
      return {
        error: [{ message: err.message, system: true} ]
      };
    };
  },
  options: {
    auth: false,
    validate: {
      validator: Joi,
      payload: {
        username: Joi.string().max(80).required(),
        password: Joi.string().max(80).required(),
        email: Joi.string().email().required(),
      }
    },
  }


};

module.exports = userAdd;
