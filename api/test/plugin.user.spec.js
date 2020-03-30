/**
 * Run test on the user interface
 */
const init = require('./init');
const chai = require('chai');
const chaiHttp = require('chai-http'); //types');
const assert = chai.assert;
const server = require('../index');
const serverUrl = server.info.uri;
chai.use(chaiHttp);

describe('api.user', async () => {

  // it('create', () => {
  //   return chai.request(serverUrl)
  //     .post('/user')
  //     .send({
  //       username: 'Jay',
  //       email: 'jay@mcanser.com',
  //       password: '1234'
  //     })
  //     .then((res) => {
  //       assert.equal(res.status, 200);
  //       assert.isDefined(res.body.message);
  //       assert.include(res.body.message, 'watsnext');
  //     });
  // });
});

