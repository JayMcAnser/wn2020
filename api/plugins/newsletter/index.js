/**
 * info related actions
 * version 0.0.1  JvK 2019-08-31
 */

const infoPlugin = {
  name: 'newsletterPlugin',
  version: '0.0.1',
  register : function(server) {
    server.route([
      require('./_get'),
      require('./_post'),
      require('./_patch')
    ])
  }
};
module.exports = infoPlugin;
