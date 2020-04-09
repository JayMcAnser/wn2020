/**
 * Write to the local config file
 *
 */

const JsonFile = require('jsonfile');
const Path = require('path');

/**
 * changes a value in the config directory
 *
 * @param key
 * @param value
 * @return {boolean}
 */

const fileName = () =>  {
  let dirName = __dirname + '/../config/';
  return Path.join(dirName,/* process.env.NODE_ENV + */  'local.json');
};

const writeValue = (key, value) => {
  let steps = key.split('.');
  let content = JsonFile.readFileSync(fileName());
  let obj = content;
  for (let l = 0; l < steps.length - 1; l++) {
    obj = obj[steps[l]];
    if (obj === undefined) {
      return false;  // not found
    }
  }
  obj[steps[steps.length - 1]] = value;
  JsonFile.writeFileSync(fileName(), content, { spaces: 2, EOL: '\r\n'});
  return true;
};


module.exports.writeValue = writeValue;
module.exports.configName = fileName;
