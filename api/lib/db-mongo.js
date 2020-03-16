/**
 * global access to the mongodb
 */

const Mongoose = require('mongoose');
const Config = require('config');
const Logging = require('./logging');

let DbMongo  = {
  /**
   * create a connection to the database
   *
   * @param options
   * @returns {Promise}
   */
  async connect(options = {}) {

    let connectionString = Config.get('Database.Mongo.host');
    if (Config.has('Database.Mongo.port')) {
      connectionString += ':' + Config.get('Database.Mongo.port')
    }
    connectionString += '/' + Config.get('Database.Mongo.database');
    if (Config.has('Database.Mongo.uriParam') && Config.get('Database.Mongo.uriParam')) {
      connectionString += '?' + Config.get('Database.Mongo.uriParam')
    }

    if (Config.has('Database.Mongo.username') && Config.get('Database.Mongo.username')) {
      let pwd = Config.get('Database.Mongo.password');
      if (pwd) {
        connectionString = `${Config.get('Database.Mongo.username')}:${Config.get('Database.Mongo.password')}@${connectionString}`
      } else {
        connectionString = `${Config.get('Database.Mongo.username')}@${connectionString}`
      }
    }
    if (Config.has('Database.Mongo.prefix') && Config.get('Database.Mongo.prefix')) {
      connectionString = `${Config.get('Database.Mongo.prefix')}://${connectionString}`;
    }

    Logging.info(`[dbMongo] connecting to ${connectionString}`);
    // https://mongoosejs.com/docs/deprecations.html
    Mongoose.set('useCreateIndex', true);
    return Mongoose.connect(connectionString, {
      useNewUrlParser : true,
   //   reconnectTries: Number.MAX_VALUE,
   //   reconnectInterval: 1000,
      useUnifiedTopology: true
    }).then( (con) => {
      this._connection = con;
      this.con.on('error', (err) => {
        Logging.error(`db-mongo error: ${err}`)
      });
      return this._connection;
    });
  },

  /**
   * get the current connection
   * @returns {Mongoose.connection|net.Socket|tls.TLSSocket|boolean|string|*}
   */
  get con() {
    return Mongoose.connection;
  }
};
module.exports = DbMongo;
module.exports.Schema = Mongoose.Schema;
module.exports.Model = Mongoose.model;
module.exports.Types = Mongoose.Types;
module.exports.ObjectId = Mongoose.Schema.Types.ObjectId;
