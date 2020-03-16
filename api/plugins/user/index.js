/**
 * info related actions
 * version 0.0.1  JaY 2020-03-14
 */

const userPlugin = {
  name: 'userPlugin',
  version: '0.0.1',
  register : function(server) {
    server.route([
      require('./_get'),
      require('./_post'),
    ])
  }
};
module.exports = userPlugin;
