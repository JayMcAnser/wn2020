/**
 * class that holds the record definition
 */

class Record {
  constructor (data = {}) {
    this._data = data;
  }

  get data() {
    return this._data;
  }
  set data(v) {
    this._data = v;
  }
}

module.exports = Record;
