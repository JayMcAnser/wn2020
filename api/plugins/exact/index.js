/**
 * info related actions
 * version 0.0.1  JaY 2020-03-14
 */

const userPlugin = {
  name: 'exactPlugin',
  version: '0.0.1',
  register : function(server) {
    server.route([
      // require('./_get'),
      // require('./register_get'),
      // require('./division_get'),
    ])
  }
};
module.exports = userPlugin;
