
// MUST load first because the Docker does not locate the configuration
process.env["NODE_CONFIG_DIR"] = __dirname + '/config/';

const Hapi = require('@hapi/hapi');
const server = require('./lib/server');
const MongoDb = require('./lib/db-mongo');
const UserObject = require('./lib/user');
const HapiAuth = require('hapi-plugin-auth');
const Logger = require('./lib/logging');


const start = async function() {
  server.decorate('request', 'user', function() { return UserObject.User });
  await HapiAuth.auth(server, UserObject.User);
  await server.register({
    plugin: require('hapi-cors'),
    options: {
      methods: ['POST, PATCH, PUT, GET, OPTIONS'],
      headers: ['Accept', 'Content-Type', 'Authorization']
    }
  });
  await server.register(HapiAuth.plugin, { routes: {prefix: '/auth'}});
  await server.register(require('./plugins'));
  await server.start();
  Logger.info(`Server running at: ${server.info.uri}, auth version ${HapiAuth.version}`);
};
start();

module.exports = server;
