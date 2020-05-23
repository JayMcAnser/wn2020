/**
 * Exact connector version 0.2.0
 *
 * ALWAYS: You need a new first token. There for
 *   1. call the registerUrl (localhost:3000/exact/registerUrl
 *   2. call the url from the result.
 *   3. login to exact
 *   4. the system will update the local.json to set the refresh token.
 *   5. access is now automatically renewed
 *
 *
 * The connector needs a place to store the refreshToken on a per client base.
 */

const axios = require('axios');
const querystring = require('querystring');
const Config = require('config');
const Logging = require('../lib/logging');
const LocalConfig = require('../lib/local-config');



/**
 * Reading and writing the refresh token
 * change these functions if there are multiple exact connections
 * @param token
 */
writeRefreshToken= function(token) {
  LocalConfig.writeValue('Exact.refreshToken', this._refreshToken);
};

readRefreshToken = function() {
  return Config.get('Exact.refreshToken');
};

class ExactConnection {
  constructor(options = {}) {
    this.writeRefreshToken = options.writeRefreshToken === undefined ? writeRefreshToken : options.writeRefreshToken;
    this.readRefreshToken = options.readRefreshToken === undefined ? readRefreshToken : options.readRefreshToken;
    this._code = options.code === undefined ? false : options.code;
    this.apiServer = axios.create({
      baseURL: 'https://start.exactonline.nl/api'
    });
    this._refreshToken = this.readRefreshToken();
    this._accessToken = false;
    this._clientId = Config.get('Exact.clientId');
    this._clientSecret = Config.get('Exact.clientSecret');
    this._tokenType = false;
    this._apiVersion = 'v1';
    this._division = false;

    // this.apiServer.interceptors.request.use(request => {
    //   console.log('Starting Request', request)
    //   return request
    // });
    this.apiServer.interceptors.response.use(null, (error) => {
      if (error.config && error.response && error.response.status === 401) {
        this._accessToken = false;
        return this.updateToken().then((token) => {
          this.setAuthorization(token);
          //   error.config.headers.Authorization = token;
          // Here, the request data will be double stringified with qs.stringify,
          // potentially leading to 422 responses or similar.
          return this.apiServer.request(error.config);
        });
      }
      if (error.response && error.response.data && error.response.data.error) {
        return Promise.reject(new Error(error.response.data.error.message.value))
      }
      return Promise.reject(error); //this.status2ApiError(error));
    });

  }


  /**
   * generate the url that should be called by the user to activate the
   * exact account. What needed is the code for the authentication
   */
  registerUrl() {
    return `${this.apiServer.defaults.baseURL}/oauth2/auth?client_id=${Config.get('Exact.clientId')}&redirect_uri=${Config.get('Exact.authUrl')}&response_type=code&force_login=0`;
  }

  /**
   * code are return when logged in from the web page. This code can be translated into the access / refresh Token
   * @return {boolean|*}
   */
  get code() {
    return this._code;
  }
  set code(v) {
    this._code = v;
  }

  setAuthorization() {
    if (this._accessToken) {
      this.apiServer.defaults.headers.common.Authorization = `${this._tokenType} ${this._accessToken}`
    } else {
      delete this.apiServer.defaults.headers.common['Authorization'];
    }
  }

  /**
   * retrieve the token for accessing excat
   *
   * @return {Promise<string>}
   */
  async updateToken() {
    if (this._accessToken === false && this._refreshToken === false) {
      throw new Error('need access token, call createAccessToken first');
    }
    if (this._accessToken === false) {
      let refresh = {
        refresh_token: this._refreshToken,
        grant_type: 'refresh_token',
        client_id: this._clientId,
        client_secret: this._clientSecret
      };
      try {
        let result = await this.apiServer.post('/oauth2/token', querystring.stringify(refresh));
        this._accessToken = result.data.access_token;
        if (Config.get('Setup.debug')) {
          Logging.info(`accessToken: ${this._accessToken}`);
        }
        this._refreshToken = result.data.refresh_token;
        this._tokenType = result.data.token_type;
        this.writeRefreshToken(this._refreshToken);
      } catch(e) {
        Logging.error(`refresh exact token (${e.message})`);
        return false;
      }
    }
    return Promise.resolve(this._accessToken);
  }
  /**
   * generate a new access token
   * https://support.exactonline.com/community/s/knowledge-base#All-All-DNO-Content-oauth-eol-oauth-dev-step3
   *
   */
  async createAccessToken() {
    let tokenRequest = {
      code: this._code,
      redirect_uri: Config.get('Exact.authUrl'),
      grant_type: "authorization_code",
      client_id: this._clientId,
      client_secret: this._clientSecret
    };
    this._accessToken = false;
    this._refreshToken = false;
    try {
      let result = await this.apiServer.post('/oauth2/token', querystring.stringify(tokenRequest));
      this._accessToken = result.data.access_token;
      if (Config.get('Setup.debug')) {
        Logging.info(`accessToken: ${this._accessToken}`);
      }
      this._refreshToken = result.data.refresh_token;
      this._tokenType = result.data.token_type;
      // LocalConfig.writeValue('Exact.refreshToken', this._refreshToken);
      this.writeRefreshToken(this._refreshToken);
      // let tx = await this.updateToken();
      return (this._accessToken && this._refreshToken);
      // set the axios header for the access token and connect the 403 to the requests
    } catch(e) {
      Logging.error(`create accessToken: ${e.message}`);
      return false;
    }
  }

  /**
   * division is needed to access a part of the api.
   *    https://start.exactonline.nl/docs/HlpRestAPIResources.aspx?SourceAction=10
   *    https://start.exactonline.nl/docs/HlpRestAPIResourcesDetails.aspx?name=SystemSystemMe
   * @return {Promise<void>}
   */
  async _retrieveDivision() {
    // let token = await this.updateToken();
    let url =  `/${this._apiVersion}/current/Me?$select=CurrentDivision`;
    let result = await this.apiServer.get(url);
    if (result.status === 200) {
      let data = result.data.d.results ? result.data.d.results[0] : {CurrentDivision: false};
      return data.CurrentDivision;
    } else {
      Logging.warn(`could not get the division from exact`);
      return false;
    }
  }

  /**
   * create the string for the url including the version of the api
   *
   * @param name String
   * @return {string}
   */
  async endpoint(name) {
    // return `/${this._apiVersion}/${name}`
    if (!this._division) {
      this._division = await this._retrieveDivision();
    }
    if (name[0] !== '/') {
      name = '/' + name;
    }
    return Promise.resolve(`/${this._apiVersion}/${this._division}${name}`);
  }

  /**
   * translate the exact result in to a readable object
   * @param result Object
   * @return Object
   * @private
   */
  _processResult(result) {
    if (result && result.data) {
      if (result.data.d) {
        if (result.data.d.results) {
          return result.data.d.results;
        } else {
          return result.data.d
        }
      } else {
        Logging.warn(`unable to parse result.data.d: ${resuls.data.toString()}`);
        return {}
      }
    } else {
      Logging.warn(`no result.data`);
      return {}
    }
  }

  /**
   * return the exact error as an object
   * @param result
   * @return {*}
   * @private
   */
  _processError(result) {
    Logging.warn(`error: ${result.toString()}`);
    return result;
  }


  /**
   * get data from the server
   * @param url
   * @param data
   * @return {Promise<AxiosResponse<T>>}
   */
  async get(url, params = {}) {
    let exactUrl = await this.endpoint(url);
    return this.apiServer.get(exactUrl).then( (result) => {
      if (result.status === 200) {
        return Promise.resolve(this._processResult(result))
      } else {
        return Promise.reject(this._processError(result));
      }
    })
  }

  /**
   * post an action to the server
   * @param url
   * @param data
   * @return {Promise<String>} Newly created ID
   */
  async post(url, data) {
    let exactUrl = await this.endpoint(url);
    return this.apiServer.post(exactUrl, data).then( (result) => {
      if (result.status === 201) {  // status 201 === created
        return Promise.resolve(result.data.d.ID)
      } else {
        return Promise.reject(this._processError(result));
      }
    })
  }

  /**
   * update an record
   *
   * @param url
   * @param data
   * @return {Promise<AxiosResponse<T>>}
   */
  async put(url, data) {
    let exactUrl = await this.endpoint(url);
    return this.apiServer.put(exactUrl, data).then( (result) => {
      if (result.status === 204) {  // status 201 === no content
        return Promise.resolve(true);
      } else {
        return Promise.reject(this._processError(result));
      }
    })
  }

  /**
   * delete an record
   *
   * @param url
   * @param data
   * @return {Promise<AxiosResponse<T>>}
   */
  async delete(url, data) {
    let exactUrl = await this.endpoint(url);
    return this.apiServer.delete(exactUrl, data).then( (result) => {
      if (result.status === 204) {  // status 201 === no content
        return Promise.resolve(true);
      } else {
        return Promise.reject(this._processError(result));
      }
    })
  }


}



const exact = new ExactConnection();

module.exports = ExactConnection;
module.exports.exact = exact;
