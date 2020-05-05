/**
 * the basic class to connect to the Exact Endpoint
 */

const connection = require('./exact-conection').exact;

class Endpoint {
  constructor(options = {}) {
    this._connection  = options.connection === undefined ? connection : options.connection;
    this._rootUrl = options.rootUrl;
  }
  /**
   * create a new Contact and returns the id
   * @param data
   * @return Promise
   */
  create(data) {
    return this._connection.post(this._rootUrl, data).then( (id) => {
      let rec = new this._createRec({id : id, endPoint: this});
      return rec;
    });
  }

  update(id, data) {
    let url = `${this._rootUrl}(guid'${id}')`;
    return this._connection.put(url, data);
  }

  delete(id) {
    let url = `${this._rootUrl}(guid'${id}')`;
    return this._connection.delete(url);
  }

  findById(id) {
    let url = `${this._rootUrl}(guid'${id}')`;
    return this._connection.get(url).then((itm) => {
      if (itm) {
        return itm;
      }
      return false;
    });
  }

  /**
   *
   * @param options Object
   *    - id: the unique id
   *    - endPoint: the end point to use
   * @private
   */
  _createRec(options) {
    throw new Error('_createRec must be overruled')
  }
}

module.exports = Endpoint;
