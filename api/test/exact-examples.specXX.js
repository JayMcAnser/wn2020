/**
 * Test the ExactConnection interface
 */

const init = require('./init');
const chai = require('chai');
const assert = chai.assert;

const example = require('../exact/examples');


describe('exact - examples', () => {
  it ('run test', () => {
    let t = example.testObj();
    assert.equal(t.contact.length, 1);
    t.contact.add('Jane');
    assert.equal(t.contact.length, 2);
  });

  it('dirty detect', () => {
    let t = example.testDirty();
    t.contact.add({name: 'Doe', firstName: 'John'});
    assert.isTrue(t.contact.dirty());
    t.dirtyClear();
    assert.isFalse(t.contact.dirty());
    assert.equal(t.contact.length, 1);
    t.contact[0].firstName = 'Jane';
    assert.isTrue(t.contact.dirty());
    assert.isTrue(t.isDirty);
  })
});
