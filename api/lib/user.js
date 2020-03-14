/**
 * user class
 *
 */
const _ = require('lodash');
const ErrorTypes = require('error-types');
const JsonWebToken = require('jsonwebtoken');

// const Customer = require('./customer');
const Customer = {
  find(name) {
    return {
      didLogin: true
    }
  }


}

// const Customer = 'test';
// const Password = '123456';
// const Username = 'api.call';
// const RefreshToken = 'eyBBBJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJrZXkiOiJ2YWwiLCJpYXQiOjE0MjI2MDU0NDV9.eUiabuiKv-8PYk2AkGY4Fb5KMZeorYBLw2a439tPQD5lM'


/**
 * object that holds the user specific information
 */

const User = {
  /**
   * returns the secret key of the server.
   * @return {string}
   */
  get authKey() {
    return 'NeverShareYourSecret';
  },

  /**
   * registers a new user.
   *
   * @param options Object
   *    account: Joi.string().allow('').optional(),
   *    username: Joi.string(),
   *    password: Joi.string(),
   *    email: Joi.string(),
   *    accept: Joi.boolean(),
   *    reset: Joi.boolean().optional()      // remove all info if it's a login
   *
   * @return Promise same fields AND: isExisting if account aready existed
   */
  create(options) {
    return Promise.reject('This interface can not create accounts');
  },
  /**
   *
   * @param info Object
   *    username: Joi.string(),
   *    email: Joi.string(),
   *    password: Joi.string()
   * @return Promise (token: ... and refreshToken }
   *   the token must be signed with the authKey and the data needed to return in the session
   */

  login(info = {}) {
    let s = this.sessions;
    if (!this.sessions) { throw new ErrorTypes.ErrorNotImplemented('missing user.sessions')}
    let customer = Customer.find(info);

    if (!customer) {
    // if (info.password !== Password || info.username !== Username || info.customer !== Customer) {
      return Promise.reject(new ErrorTypes.ErrorAccessDenied());
    }

    let sessionId = this.sessions.add(customer);
    return Promise.resolve(_.merge(info, { token: JsonWebToken.sign({id: sessionId}, this.authKey)}));
  },

  resetAccount(payload) {
    return Promise.reject('This interface can not reset accounts');
  },
  refreshToken(token, request) {
    return Promise.reject('This interface can not refresh tokens');
  },

  /**
   * create a new session object
   * @param obj Object the information stored with the login en signed by JWT
   * @return Object
   */
  createSession(obj) {
    return User.sessions.get(obj.id);
  }
};

module.exports.User = User;
