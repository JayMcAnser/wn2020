/**
 * retrieving default values
 *
 * Jay 2020-10-04
 */

const Config = require('config');

/**
 *
 * @param key String - a multi level string like: distribution.art.name
 * @param defaultValue - the value if the key is not found
 */
const getValue = (key, defaultValue) => {
  // TODO: build a reader for the config
  switch (key) {
    case 'doc.menu': return '[Home](http://localhost:3000/doc/)';
    case 'doc.rootUrl': return 'http://localhost:3000/doc/';
    default:
      return defaultValue
  }
}

module.exports.value = getValue;

module.exports.royaltiesArtPercentage = 'royalties.art.percentage'
