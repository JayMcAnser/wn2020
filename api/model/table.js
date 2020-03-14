/**
 * a table definition
 * version 2020-02-08
 */
const Logging = require('../lib/logging');
const ErrorStoreNotFound = require('error-types').ErrorFieldNotFound;

class Table {
  constructor (options= {}) {
    if (options.constructor && (options.constructor.name === 'DataStore' || options.constructor.name === 'Db')) {
      this._store = options;
      this._name = this.constructor.name;
    } else {
      if (!options.store) {
        if (process.env.NODE_ENV !== 'test') {
          Logging.error(`no store give for ${this.constructor.name}`);
        }
        throw new ErrorStoreNotFound('xx', 'store is missing')
      }
      this._store = options.store;
      this._name = options.name !== undefined ? options.name : this.constructor.name;
    }

    this._store.register(this._name, this);
  }

  get name() {
    return this._name;
  }

  get(id) {
    return this._store.get(this.name, id)
  }

  add(record) {
    return this._store.add(this.name, record);
  }
  update(id, record) {
    return this._store.update(this.name, id, record);
  }
  delete(id) {
    return this._store.delete(this.name, id);
  }
  find(values) {
    return this._store.find(this.name, values);
  }
  findOne(values) {
    return this._store.findOne(this.name, values);
  }
  recordCount() {
    return this._store.recordCount(this.name);
  }
}
module.exports = Table;
