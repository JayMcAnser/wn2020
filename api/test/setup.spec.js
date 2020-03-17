/**
 * Test the group model
 */

const Db = require('./init.db');
const chai = require('chai');
const assert = chai.assert;
const Setup = require('../lib/setup');

describe('setup', () => {
  it('run', async () => {
    let setup = new Setup();
    assert.isTrue(await setup.run())
  })
});
