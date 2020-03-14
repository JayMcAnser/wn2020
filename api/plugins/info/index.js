/**
 * info related actions
 * version 0.0.1  JvK 2019-08-31
 */

const infoPlugin = {
  name: 'infoPlugin',
  version: '0.0.1',
  register : function(server) {
    server.route([
      require('./_get'),
    ])
  }
};
module.exports = infoPlugin;
