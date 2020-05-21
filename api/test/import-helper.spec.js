/**
 * Testing import helper function
 */

const chai = require('chai');
const assert = chai.assert;
const ImportHelper = require('../import/import-helper');

describe('import-helper', () => {
  it('makeNumber', () => {
    assert.equal(ImportHelper.makeNumber('0'), 0);
    assert.equal(ImportHelper.makeNumber('10'), 1000);
    assert.equal(ImportHelper.makeNumber('0,20'), 20);
    assert.equal(ImportHelper.makeNumber('10.0'), 1000)
    assert.equal(ImportHelper.makeNumber(10.2), 1020);
  });


})
