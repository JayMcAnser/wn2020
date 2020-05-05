class ExactRecord {

  constructor(options) {
    this._endPoint = options.endPoint;
    this._id = options.id;
    if (options.data) {
      this._data = options.data;
    } else {
      this._data = false;
    }
  }

  /**
   * update the field defined by data
   * @param data.
   * @return Promise
   */
  save(data) {

  }
  
}

module.exports = ExactRecord;
