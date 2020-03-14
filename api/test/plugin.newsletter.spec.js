/**
 * Run test on the newsletter interface
 */
const init = require('./init');

const chai = require('chai');
const chaiHttp = require('chai-http'); //types');
const assert = chai.assert;

const server = require('../index');
const serverUrl = server.info.uri;
const Db = require('../model/db').db;
chai.use(chaiHttp);

describe('api.newsletter', async () => {
  const EMAIL = 'jay@mcancer.com';
  const NAME = 'Jay';

  before( async () => {
    let nws = await  Db.tables.Newsletter;
    let rec = await nws.findOne({name: NAME, email: EMAIL});
    if (rec) {
      await nws.delete(rec._id);
    }
  })

  it('is api active', () => {
    return chai.request(serverUrl)
      .get('/newsletter')
      .then((res) => {
        assert.equal(res.status, 200, 'status ok');
        assert.equal(res.text, 'hi, do you want a newsletter?', 'api active');
      });
  });

  it('register user', async () => {
    await chai.request(serverUrl)
      .post('/newsletter')
      .send({
        email: EMAIL,
        name: NAME
      })
      .then((res) => {
        assert.equal(res.status, 200, 'status ok');
        assert.equal(res.body.status, 1, 'did send mail');
        assert.equal(res.body.message, 'invitation send');
      });
  })
  it('register user - missing email', async () => {
    await chai.request(serverUrl)
      .post('/newsletter')
      .send({
        name: 'jay mcancer'
      })
      .then((res) => {
        assert.equal(res.status, 200, 'did retrieve');
        assert.equal(res.body.status, -1, 'bad data');
        assert.equal(res.body.message, 'missing or bad email address', 'no email to run');
      });
  })

  it('register user - bad email', async () => {
    await chai.request(serverUrl)
      .post('/newsletter')
      .send({
        email: 'jay@xx'
      })
      .then((res) => {
        assert.equal(res.status, 200, 'did retrieve');
        assert.equal(res.body.status, -1, 'bad data');
        assert.equal(res.body.message, 'missing or bad email address', 'no email to run');
      });
  });

  it('register user - resend', async () => {
    await chai.request(serverUrl)
      .post('/newsletter')
      .send({
        email: EMAIL,
        name: NAME
      })
      .then((res) => {
        assert.equal(res.status, 200, 'status ok');
        assert.equal(res.body.status, 2, 'did send mail');
        assert.equal(res.body.message, 'resend invitation');
      });
  })

  it('confirm key - not found', async () => {
    await chai.request(serverUrl)
      .patch('/newsletter/11223344')
      .then((res) => {
        assert.equal(res.status, 200, 'status ok');
        assert.equal(res.body.status, -1, 'not found');
        assert.equal(res.body.message, 'key not found');
      });
  });

  it('confirm key - found', async () => {
    let nws = await  Db.tables.Newsletter;
    let rec = await nws.findOne({name: NAME, email: EMAIL});
    if (!rec) {
      assert.fail('record not found');
    }
    await chai.request(serverUrl)
      .patch('/newsletter/' + rec.confirmKey)
      .then((res) => {
        assert.equal(res.status, 200, 'status ok');
        assert.equal(res.body.status, 1, 'did accept');
        assert.equal(res.body.message, 'confirmed');
      });
  });

  it('confirm key - already done', async () => {
    let nws = await  Db.tables.Newsletter;
    let rec = await nws.findOne({name: NAME, email: EMAIL});
    if (!rec) {
      assert.fail('record not found');
    }
    await chai.request(serverUrl)
      .patch('/newsletter/' + rec.confirmKey)
      .then((res) => {
        assert.equal(res.status, 200, 'status ok');
        assert.equal(res.body.status, 2, 'did accept');
        assert.equal(res.body.message, 'already confirmed');
      });
  });

});

