/**
 * call the server
 *
 * 2020-01-21 version 0.2 Changed response because only one parameter is allowed
 */

import ApiCall, {ApiAccessDenied, ApiDuplicate, ApiError, ApiNotFound, ApiServerError, ApiUnknown} from './api-call';
import axios from 'axios';



class ApiCallAxios extends ApiCall {

  constructor(options) {
    super(options);
    this._token = false;
    this._tokenField = options && options.token ? options.token : 'token';
    this._refreshRecord = {};

    this.apiServer = axios.create({
      baseURL:  process.env.API_SERVER,
    });
//    console.info('API server: ', process.env.API_SERVER);

    this.apiServer.interceptors.request.use(request => {
//      console.log('Starting Request', request)
      return request
    });

    this.apiServer.interceptors.response.use(null, (error) => {
      if (error.config && error.response && error.response.status === 401) {
        return this.updateToken().then((token) => {
          this.setAuthorization(token);
          error.config.headers.Authorization = token;
          // Here, the request data will be double stringified with qs.stringify,
          // potentially leading to 422 responses or similar.
          return this.apiServer.request(error.config);
        });
      }
      return Promise.reject(error); //this.status2ApiError(error));
    });
  }

  login(user) {
    return super.login(user).then( (result) => {
      this._refreshRecord = {
        user: result.user,
        refreshToken: result.refreshToken
      };
      return Promise.resolve(result);
    })
  }

  setAuthorization(token) {
    super.setAuthorization(token);
    this._token = token;
    if (token) {
      this.apiServer.defaults.headers.common.Authorization = token;
    } else {
      delete this.apiServer.defaults.headers.common['Authorization'];
    }
  }

  updateToken() {
    return this.post('auth/refresh', this._refreshRecord);
  }
  /**
   * return this._handleResponse(this.apiServer.post(key, object)
   * @param action Object the result from the current action
   * @private
   */
  /**
   * translate the response into something of just data, or reject with an structure
   * @param action
   * @return {Promise<never>|Promise<unknown>}
   * @private
   */
  _handleResponse(action) {
    if (action.status && action.status === 200) {
      return Promise.resolve(action.data);
    }
    // WHY NOT AN ERROR, but a string??????
    // because the raw version has to translate the error into something beautiful
    return Promise.reject({ status: action.status, message: action.message, error: action});
  }
  get(key, id) {
    return this.apiServer.get(key + '/' + id).then( (result) => {
      return this._handleResponse(result);
    }).catch( (err) => {
      return Promise.reject(this.status2ApiError(err));
    })
  }

  post(key, object) {
    return this.apiServer.post(key, object).then( (result) => {
      return this._handleResponse(result);
    }).catch( (err) => {
      return Promise.reject(this.status2ApiError(err));
    })
  }
  put(key, object) {
    return this.apiServer.put(key, object).then( (result) => {
      return this._handleResponse(result);
    }).catch( (err) => {
      return Promise.reject(this.status2ApiError(err));
    })
  }
  patch(key, object) {
    return this.apiServer.patch(key, object).then( (result) => {
      return this._handleResponse(result);
    }).catch( (err) => {
      return Promise.reject(this.status2ApiError(err));
    })
  }
  delete(key, id) {
    let route = id === undefined ? key : `${key}/${id}`;
    return this.apiServer.delete(route).then( (result) => {
      return this._handleResponse(result);
    }).catch( (err) => {
      return Promise.reject(this.status2ApiError(err));
    })
  }

  /**
   *
   * @param message err { status, message, error }
   * @returns Error(...)
   */
  status2ApiError(err) {
    if (err.response && err.response.status) {
      return super.status2ApiError(err.status, err.message, err.error);
    } else if (err.request) {
      return new ApiServerError(501, 'No response');
    } else {
      return super.status2ApiError(-1, message ? message : err.message, err)
    }
  }
}

export default ApiCallAxios;
