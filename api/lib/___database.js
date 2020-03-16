/**
 * the global mongoose drive
 *
 * @type {Mongoose}
 */

const Mongoose = require('mongoose');
const Config = require('config');


function init() {
  if (! (Config.has('Database') && Config.has('Database/connectionString')) ) {
    console.log('[Error: Database] missing Database/connectionString')
    return;
  }

  Mongoose.connect()
}
