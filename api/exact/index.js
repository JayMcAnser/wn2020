/**
 * Exact connector version 0.0.1
 *
 */

const axios = require('axios');
const querystring = require('querystring');
const Config = require('config');
const Logging = require('../lib/logging');
const LocalConfig = require('../lib/local-config');

class Exact {
  constructor(options = {}) {
    this._code = options.code === undefined ? false : options.code;
    this.apiServer = axios.create({
      baseURL: 'https://start.exactonline.nl/api'
    });
    this._refreshToken = Config.get('Exact.refreshToken');
    this._accessToken = false;
    this._clientId = Config.get('Exact.clientId');
    this._clientSecret = Config.get('Exact.clientSecret');
    this._tokenType = false;
    this._apiVersion = 'v1';
    // this.apiServer.interceptors.request.use(request => {
    //   console.log('Starting Request', request)
    //   return request
    // })
    this.apiServer.interceptors.response.use(null, (error) => {
      if (error.config && error.response && error.response.status === 401) {
        return this.updateToken().then((token) => {
          this.setAuthorization(token);
       //   error.config.headers.Authorization = token;
          // Here, the request data will be double stringified with qs.stringify,
          // potentially leading to 422 responses or similar.
          return this.apiServer.request(error.config);
        });
      }
      return Promise.reject(error); //this.status2ApiError(error));
    });

  }

  /**
   * create the string for the url including the version of the api
   *
   * @param name String
   * @return {string}
   */
  endpoint(name) {
    return `/${this._apiVersion}/${name}`
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
        this._refreshToken = result.data.refresh_token;
        this._tokenType = result.data.token_type;
        LocalConfig.writeValue('Exact.refreshToken', this._refreshToken);
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
      // this._accessToken = result.data.access_token;
      this._refreshToken = result.data.refresh_token;
      this._tokenType = result.data.token_type;
      LocalConfig.writeValue('Exact.refreshToken', this._refreshToken);
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
  async division() {
   // let token = await this.updateToken();
    let url = this.endpoint('current/Me?$select=CurrentDivision');
    // this.setAuthorization(token);
    let result = await this.apiServer.get(url);
    if (result.status === 200) {
      let data = result.data.d.results ? result.data.d.results[0] : {CurrentDivision: false};
      return data.CurrentDivision;
    } else {
      Logging.warn(`could not get division from exact`);
    }
    return false;
  }

}



const exact = new Exact();

module.exports = Exact;
module.exports.exact = exact;
