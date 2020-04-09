/**
 * Test the exact interface
 */

const init = require('./init');
const chai = require('chai');
const assert = chai.assert;
const exact = require('../exact').exact;

describe('exact', function() {

  describe('general', () => {
    it('division', async() => {
      let div = await exact._retrieveDivision();
      assert.equal(div, 2722931)
    })
  });
  //
  // describe('get', () => {
  //   it('crm', () => {
  //
  //   })
  // })
});
