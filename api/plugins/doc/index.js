/**
 * element related actions
 */

const publicPlugin = {
  name: 'publicPlugin',
  version: '0.0.1',
  register : function(server) {
    server.route([
      require('./d_get'),
      require('./_get'),
    ])
  }
};
module.exports = publicPlugin;
