/**
 * generate a global logging definition defined by the /config directory
 * for definition see /node_modules/logger/README.md
 *
 * @type {LogWinston}
 */

const LogWinston = require('logger').LogWinston;
const LogFake = require('logger').LogFake;
const Config = require('config');

let logger = false;
const initLogger = () => {
  if (Config.has('Logging')) {
    let logConfig = Config.get('Logging');
    if (logConfig.transports) {
      // patch path so everyhing is logged in the logging directory
      for (let l = 0; l < logConfig.transports.length; l++) {
        if (logConfig.transports[l].type === 'file' && logConfig.transports[l].filename && logConfig.transports[l].filename[0] !== '/') {
          logConfig.transports[l].filename = Path.join(__dirname, '../..', logConfig.transports[l].filename);
        }
      }
    }
    logger = new LogWinston(logConfig);
  } else {
    logger = new LogFake();
  }
};

initLogger();

module.exports = logger;
