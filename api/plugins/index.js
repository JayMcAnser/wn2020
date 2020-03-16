/**
 * System wide loading of the plugins
 * returns the plugins array
 *
 * version 0.1 jvk 2020-03-14
 */

module.exports = [
  {
    plugin: require('./info'),
    routes: {
      prefix: '/info'
    },
  },
  {
    plugin: require('./user'),
    routes: {
      prefix: '/user'
    }
  }
];

