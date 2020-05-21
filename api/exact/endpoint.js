/**
 * the basic class to connect to the Exact Endpoint
 */

const connection = require('./exact-conection').exact;
const camelCase = require('camelcase');

class Endpoint {
  constructor(data = {}, options = {}) {
    this._connection  = options.connection === undefined ? connection : options.connection;
    this._rootUrl = options.rootUrl;
    this._id = false;
    this._data = data;
  }

  // /**
  //  * true if the record is new
  //  * @return {boolean}
  //  */
  // get isNew() {
  //   return ! this._id;
  // }
  //
  // /**
  //  * the id of the current record
  //  * @return {boolean}
  //  */
  // get id() {
  //   return this._id
  // }

  /**
   * retrieve the data as an exact record
   * @return {{}}
   */
  get asExact() {
    let d = {}
    for (let key in this._data) {
      if (!this._data.hasOwnProperty(key)) { continue }
      d[camelCase(key, {pascalCase: true})] = this._data[key];
    }
    return d;
  }

  /**
   * takes the raw Exact data and convert it into the internal structure
   * @param data
   */
  fromExact(data) {
    this._data = {}
    for (let key in data) {
      if (!data.hasOwnProperty(key)) { continue }
      this._data[camelCase(key)] = data[key];
    }
    this._id = data.ID;
  }

  get data() {
    return this._data;
  }

  /**
   * save the current record to exact
   * @return {Promise<void>}
   */
  save() {
    if (this.isNew) {
      return this._connection.post(this._rootUrl, this.asExact).then((id) => {
        this._id = id;
        return Promise.resolve(id);
      })
    } else {
      let url = `${this._rootUrl}(guid'${id}')`;
      return this._connection.put(url, this.asExact);
    }
  }

  findById(id, options) {
    return this._connection.get(`${this._rootUrl}?$filter=ID eq guid'${id}'`).then( (rec) => {
      if (rec && rec.length === 1) {
        this.fromExact(rec[0]);
        return Promise.resolve(this);
      }
      return Promise.resolve(false);
    });
  }

  delete() {
    if (!this.isNew) {
      let url = `${this._rootUrl}(guid'${id}')`;
      return this._connection.delete(url);
    }
    return Promise.resolve(true);
  }
}

class ExactModel {

  static makeReactive(obj) {
    return new Proxy(obj, {
      get: function(obj, prop) {
        if (obj[prop]) {
          return obj[prop]
        }
        switch (prop) {
          case 'isNew':
            return !obj._id;
          case 'id':
            return obj._id
          default:
            return obj._data[prop];
        }
      }
    })
  }
  /**
   *
   * @param id String the unique string of the account
   *
   * @return {Promise<AccountRecord>} or Promise(false) if not found
   */
  static findById(id) {

    return Promise.resolve(false)
  }

  /**
   * returns an empty, not yet stored, AccountRecord
   * @param data
   * @returns a AccountRecord
   */
  static create(data, options) {
    throw new Error('the ExactModel.create must be overloaded')
  }
}


module.exports = Endpoint;
module.exports.Model = ExactModel;
