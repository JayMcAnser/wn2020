/**
 * DataStore on disk
 * version 0.0.1 JvK 2020-02-07
 */

const Config = require('config');
const Logging = require('../lib/logging');
const JsonFile = require('jsonfile');
const fs = require('fs');
const Path = require('path');
const ErrorTypes = require('error-types');
const ErrorNotFound = require('error-types').ErrorNotFound
const uuid = require('uuid').v4;
const Table = require('./table');


class DataStore {
  constructor () {
    this._dataDir = Path.resolve(Config.has('Storage') ? Config.get('Storage.directory') : '../data');
    if (!fs.existsSync(this._dataDir)) {
      Logging.info(`Creating data directory ${this._dataDir}`);
      fs.mkdirSync(this._dataDir);
    }
    this._stores = {};
    this._tables = {};
  }

  get dataDir() {
    return this._dataDir;
  }

  register(name, table) {
    if (!this._stores[name]) {
      this._stores[name] = {
        filename: Path.join(this._dataDir, name + '.json'),
        data: {},
        table: table
      }
      if (fs.existsSync(this._stores[name].filename)) {
        this._stores[name].data = JsonFile.readFileSync(this._stores[name].filename)
      } else {
        JsonFile.writeFileSync(this._stores[name].filename, this._stores[name].data);
      }
      this._tables[name] = this._stores[name].table;
    }
    return this._tables[name];
  }

  /**
   * remove table and data
   * @param name
   */
  drop(name) {
    if (this._stores[name]) {
      fs.unlinkSync(this._stores[name].filename);
      delete this._stores[name];
      delete this._tables[name];
      return true;
    }
    return false; // not found
  }


  /**
   * check that the store is available and usable
   * @param name
   * @private
   */
  _validateStore(name) {
    if (!this._stores[name]) {
      Logging.error(`the store (${name}) does not exist`, 'model.store');
      throw new ErrorTypes.ErrorFile(`the store (${name}) does not exist`);
    }
  }
  _write(name) {
    return JsonFile.writeFile(this._stores[name].filename, this._stores[name].data);
  }
  /**
   * returns all the stores registered
   * @return {string[]}
   */
  get tableNames() {
    return Object.keys(this._stores);
  }
  get count() {
    return this.tableNames.length;
  }

  /**
   * returns the data part of the store
   * @param name
   * @return {Table}
   */
  store(name) {
    return this._stores[name].data
  }
  get tables() {
    return this._tables;
  }

  async get(name, id) {
    let r = this._stores[name].data[id];
    if (r) {
      r['_id'] = id;
      return r;
    }
    return false;
  }

  async add(name, record) {
    this._validateStore(name);
    record._id = uuid();
    this._stores[name].data[record._id] = record;
    return this._write(name).then( (aws) => {
      return record;
    });
  }

  /**
   * if record is ommited the id is used from the record
   * @param name
   * @param id
   * @param record
   * @return {Promise<any|Promise|Thenable<any>>}
   */
  async update(name, id, record) {
    this._validateStore(name);
    if (record === undefined) {
      record = id;
      id = record._id;
    }
    if (!this._stores[name].data[id]) {
      throw new ErrorNotFound('', `${this.name}.${id} was not found`);
    }
    record._id = id;
    this._stores[name].data[id] = record;
    return this._write(name).then( (aws) => {
      return record;
    });
  }

  /**
   * deletes a record and return true if it did exist
   * @param name
   * @param id
   * @return {Promise<Boolean>}
   */
  async delete(name, id) {
    this._validateStore(name);
    if (this._stores[name].data[id]) {
      delete this._stores[name].data[id];
      return this._write(name).then( () => {
        return true;
      });
    }
    return false;
  }

  /**
   * finds the records that exact matches the find
   * @param name
   * @param values Objec { fieldname: value}
   * @return {[]}
   */
  async find(name, values) {
    this._validateStore(name);
    let result = [];
    for (let id in this._stores[name].data) {
      if (!this._stores[name].data.hasOwnProperty(id)) {
        continue
      }
      let r = this._stores[name].data[id]
      for (let fieldName in values) {
        if (!values.hasOwnProperty(fieldName)) {
          continue
        }
        if (values[fieldName] !== r[fieldName]) {
          r = false
          break;
        }
      }
      if (r) {
        result.push(r)
      }
    }
    return result;
  }

  async findOne(name, values) {
    this._validateStore(name);
    for (let id in this._stores[name].data) {
      if (!this._stores[name].data.hasOwnProperty(id)) {
        continue
      }
      let r = this._stores[name].data[id]
      let found = true;
      for (let fieldName in values) {
        if (!values.hasOwnProperty(fieldName)) {
          continue
        }
        if (values[fieldName] !== r[fieldName]) {
          found = false;
          break;
        }
      }
      if (found) {
        return r;
      }
    }
    return false;
  }



  recordCount(name) {
    if (!this._stores[name]) {
      return undefined;
    }
    return Object.keys(this._stores[name].data).length;
  }
}

module.exports = DataStore;
// used for a global definition so we can say
// let tbl = new NewsletterTable(require('./store').GlobalStore)
module.exports.GlobalStore = new DataStore()
