/**
 * System wide loading of the plugins
 * returns the plugins array
 *
 * version 0.2 jay 2020-10-05
 */

module.exports = [
  {
    plugin: require('./doc'),
    routes: {
      prefix: '/doc'
    },
  },
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
  },
  {
    plugin: require('./exact'),
    routes: {
      prefix: '/exact'
    }
  },

];

