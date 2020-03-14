
// MUST load first because the Docker does not locate the configuration
process.env["NODE_CONFIG_DIR"] = __dirname + '/config/';

const Hapi = require('@hapi/hapi');
const server = require('./lib/server');
const UserObject = require('./lib/user');
const HapiAuth = require('hapi-plugin-auth');
const Logger = require('./lib/logging');
// const Sessions = require('./lib/sessions');


const start = async function() {
  // store our session pool with the user
//  UserObject.User.sessions = new Sessions();

  server.decorate('request', 'user', function() { return UserObject.User });
  await HapiAuth.auth(server, UserObject.User);
  await server.register({
    plugin: require('hapi-cors'),
    options: {
      methods: ['POST, PATCH, PUT, GET, OPTIONS'],
      headers: ['Accept', 'Content-Type', 'Authorization']
    }
  })
  await server.register(HapiAuth.plugin, { routes: {prefix: '/auth'}});
  await server.register(require('./plugins'));
  await server.start();
  Logger.info(`Server running at: ${server.info.uri}, auth version ${HapiAuth.version}`);
  // console.log(`Server running at: ${server.info.uri}\n* auth version ${HapiAuth.version}\n`);
};
start();

module.exports = server;
