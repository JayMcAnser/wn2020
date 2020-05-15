/**
 * DbMysql connector to the mysql database
 */

const MySQL = require('promise-mysql');
const Config = require('config');
const Logging = require('./logging');

let DbMysql  = {
  _wrapMysql(mysql, fnName) {
    const createConnection = mysql.createConnection;

    mysql.createConnection = function () {
      Logging.info(`mysql: connect to ${arguments[0].host}${arguments[0].port ? ':' + arguments[0].port: ''}/${arguments[0].database} as ${arguments[0].user}`);
      mysql.createConnection = createConnection;

      return createConnection(...arguments);
    };
    return mysql;
  },

  async connect(options = {}) {
    if (!this.connection) {
      this.connection = await MySQL.createConnection({
        host: Config.get('Database.MySQL.host'),
        user: Config.get('Database.MySQL.username'),
        password: Config.get('Database.MySQL.password'),
        database: Config.get('Database.MySQL.database'),
        mysqlWrapper: (mysqlInstance) => {
          return this._wrapMysql(mysqlInstance, 'runReturn')
        }
      });
    }
    return Promise.resolve(this.connection)
    // this.connection.connect( function(err) {
    //   if (err) {
    //     Logging.error(`[mysql.connect]: ${err.message}`)
    //   } else {
    //     Logging.info(`connected to mysql as ${this.connection.threadId}`)
    //   }
    // })
  },

  async query(sql, params = {}) {
    return this.connection.query(sql, params)
  }
};

module.exports = DbMysql;
