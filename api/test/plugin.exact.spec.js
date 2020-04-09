/**
 * Run test on the info interface
 */
const init = require('./init');
const chai = require('chai');
const chaiHttp = require('chai-http'); //types');
const assert = chai.assert;
const server = require('../index');
const serverUrl = server.info.uri;
chai.use(chaiHttp);

describe('api.exact', async () => {

  it('is api active', () => {
    return chai.request(serverUrl)
      .get('/exact')
      .then((res) => {
        assert.equal(res.status, 200, 'status ok');
      });
  });
});

