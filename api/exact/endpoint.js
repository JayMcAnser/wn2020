/**
 * the basic class to connect to the Exact Endpoint
 */

const connection = require('./exact-conection').exact;
const camelCase = require('camelcase');
const buildQuery = require('odata-query').default;

class Endpoint {
  constructor(data = {}, options = {}) {
    this._connection  = options.connection === undefined ? connection : options.connection;
    this._rootUrl = options.rootUrl;
    this._id = false;
    this._data = data;
    this._removeFields = ['Metadata', 'Id', 'Created', 'Hid', 'Modified', 'StartDate']
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
    for (let l = 0; l < this._removeFields.length; l++) {
      delete d[this._removeFields[l]];
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
      let url = `${this._rootUrl}(guid'${this._id}')`;
      let d = this.asExact;
     // d = {lastName: 'Done it'}
      return this._connection.put(url, d);
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

  /**
   * BE CAREFULL:
   *   The fieldnames used are in Exact definition in the query NOT IN CAMEL_CASE !!!!!
   *
   * examples
   *   https://github.com/techniq/odata-query
   * @param query
   */
  find(query) {
    let filter = buildQuery({ filter: query});
    return this._connection.get(`${this._rootUrl}${filter}`).then( (recs) => {
      if (recs && recs.length > 0) {
        let result = [];
        for (let l = 0; l < recs.length; l++) {
          let r = new [this.constructor.name](this.fromExact(recs[l]));
          result.push(r);
        }
        return Promise.resolve(result);
      }
      return Promise.resolve([]);
    });

  }

  delete() {
    if (!this.isNew) {
      let url = `${this._rootUrl}(guid'${this.id}')`;
      return this._connection.delete(url);
    }
    return Promise.resolve(true);
  }
}

class ExactModel {

  static makeReactive(obj) {
    return new Proxy(obj, {
      get: function(obj, prop) {
        if (obj[prop] !== undefined) {
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
      },
      set: function(obj, prop, value) {
        if (obj[prop] !== undefined) {
          obj[prop] = value;
          return true;
        }
        switch (prop) {
          case 'isNew': return false;
          case 'id': return false;
          default:
            obj._data[prop] = value;
            return true;
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
module.exports.Record = Endpoint;
