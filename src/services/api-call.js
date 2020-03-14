/**
 * handling all http requests
 *
 * version 0.0.1 jvk 2018-12-19
 *
 *
 * RefreshToken functions:
 * https://github.com/axios/axios/issues/934
 */
//import Vue from 'vue';
import _ from 'lodash';

const sha1 = require('sha1');

export class ApiError extends Error {
  // https://javascript.info/custom-errors
  constructor(message, statusCode = false) {
    super(message);
    // can not use this.constructor.name:   it returns 'unexpected string'
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export class ApiDuplicate extends ApiError {
  constructor(message = 'duplicate', data = {}) {
    super(message, 409);
    // can not use this.constructor.name:   it returns 'unexpected string'
    this.name = 'ApiDuplicate';
    this.field = data;
  }
}

export class ApiNotFound extends ApiError {
  constructor(message = 'not found') {
    super(message, 404);
    // can not use this.constructor.name:   it returns 'unexpected string'
    this.name = 'ApiNotFound';
  }
}

export class ApiAccessDenied extends ApiError {
  constructor(message = 'access denied') {
    super(message, 403);
    // can not use this.constructor.name:   it returns 'unexpected string'
    this.name = 'ApiAccessDenied';
  }
}


export class ApiServerError extends ApiError {
  constructor(message) {
    super(message, 500);
    // can not use this.constructor.name:   it returns 'unexpected string'
    this.name = 'ApiServerError';
  }
}
export class ApiDataError extends ApiError {
  constructor(message = 'data error') {
    if (_.isObject(message)) {
      super('data error', 401);
      this._errors = [];
      this.add(message.type, message.fieldname, message.message);
    } else {
      super(message, 401);
      this._errors = [];
    }
    this.name = 'ApiDataError';
  }

  get length() {
    return this._errors.length;
  }
  error(index) {
    return this._errors[index];
  }
  add(type, fieldname, message, data) {
    this._errors.push( {
      type: type,
      fieldname: fieldname,
      message: message,
      data: data
    })
  }
}

export class ApiUnknown extends ApiError {
  constructor(message, statusCode = false) {
    super(message + ` (unknown error: ${statusCode})`, 500);
    // can not use this.constructor.name:   it returns 'unexpected string'
    this.name = 'ApiUnknown';
  }
}

export class ApiBadRequest extends ApiError {
  constructor(message, statusCode = false) {
    super(message, 400);
    // can not use this.constructor.name:   it returns 'unexpected string'
    this.name = 'ApiBadRequest';
  }
}

class ApiCall  {

  constructor(options = {}) {
    this._token = false;
    this._tokenField = options.tokenField ? options.tokenField : 'token'
  }

  status2ApiError(status, message, error) {
    // we should log the error for debug porpuse !
    if (status) {
      switch(status) {
        case 400:
          console.log('ERROR:', error)
          return new ApiBadRequest(message);
        case 403: return new ApiAccessDenied(message);
        case 404: return new ApiNotFound(message);
        case 409: return new ApiDuplicate(message, error.response.data.details);
        case 500: return new ApiServerError(message);
        default: return new ApiUnknown(message, status);
      }
    } else {
      return new ApiError(message, -1 )
    }
  }



  get(key, id) {
    console.log(`GET: ${key} id: ${id}`);
    return Promise.resolve()
  }

  post(key, object) {
    console.log(`POST: ${key} object: ` + JSON.stringify(object));
    return Promise.resolve();
  }
  put(key, id, object) {
    console.log(`PUT: ${key} id: ${id}, object:` + JSON.stringify(object));
    return Promise.resolve()
  }
  patch(key, id, object) {
    console.log(`PATCH: ${key} id: ${id}, object:` + JSON.stringify(object));
    return Promise.resolve()
  }

  delete(key, id) {
    console.log(`DELETE: ${key} id: ${id}`);
    return Promise.resolve()
  }

  get authorization() {
    return this._token;
  }
  set authorization(token) {
    throw new Error('ERROR: api-call use setAuthorization to change the token')
//    this._token = token;
  }
  setAuthorization(token) {
    this._token = token;
  }

  /**
   * logs the user in
   * @param user string
   * @returns Promise
   *    - resolve(userRecord)
   *    - reject(Error)
   */
  login(user) {
    const loginUser = {
      username : user.username,
      password : user.password, // sha1(user.password),
      email: user.email
    };
    this.setAuthorization(false);
    return this.post('auth/login', loginUser).then( (data) => {
      this.setAuthorization(data[this._tokenField]);
      return Promise.resolve(data);
    })
  }

  register(user) {
    const regUser = {
      account: user.account ? user.account : '',
      username: user.username,
      password: user.password,// sha1(user.password),
      email: user.email,
      accept: user.accept
    };

    if (user.reset) { // for testing and clearing an existing account
      regUser.reset = true;
    }
    this.setAuthorization(false);
    return this.post('auth/register',regUser).then( (data) => {
      this.setAuthorization(data[this._tokenField]);
      return data;
    });
  }
  /**
   * reset the account to the default settings
   * @param user
   */
  resetAccount(user, remove = false) {
    this.authorization = false;
    return this.post('auth/resetAccount', user);
  }

  /**
   * ends the user session
   *
   * @returns {Promise<boolean>}
   */
  logout(token) {
    this.setAuthorization(false);
    return this.delete('auth/login', this._token);
  }

  all(key, ids) {
    // GET does not support the payload, so we use the post to send the data to the server
    return this.apiServer.post(key + '/all', ids).then( (result) => {
      if (result.status === 200) {
        // data is an object of {ids[0]: obj, ids[1]: obj2 ....}
        return Promise.resolve(result.data);
      }
      return Promise.reject(new Error('status: ' + result.status));
    })
  }

   /**
   * querys the api for information.
   *
   * @param key
   * @param query: Object {findText: '..', findType: ['..','..'], order: ['..', '..']}
   * @param options Object {
   *      method: GET|POST,   how to request the information
   *      idOnly: bool        only get the ids. full info with an extra call
   *    }
   * @returns {Promise<AxiosResponse<any> | never>}
   */
  find(key, query, options = {}) {
    return ((options.method === 'GET') ?
      this.apiServer.get(key + '/find', {params: { q : query, idOnly: options.idOnly} }):
      this.apiServer.post(key + '/find',{ query : query, idOnly: options.idOnly })).then( (result) => {
        return result.data;
    });
    //         .then( (result) => {
    //    if (result.status === 200) {
         // server did only return the ids, so we have to get the entry version
    //      return Promise.resolve(result.data);
    //    } else {
    //      return Promise.reject(new Error('status: ' + result.status));
    //    }
    //});
  }
}

export default ApiCall;

