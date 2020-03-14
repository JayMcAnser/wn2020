/**
 * Dropper main server file
 *
 * version 0.1.0  jvk 2018-11-25
 */
const Config = require('config');
const Hapi = require('@hapi/hapi');

const server = new Hapi.Server({
  port: Config.Server.Connection.port,
  host: 'localhost'
});

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

module.exports = server;

