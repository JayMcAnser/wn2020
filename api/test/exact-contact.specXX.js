/**
 * Test the ExactConnection interface
 */

const init = require('./init');
const chai = require('chai');
const assert = chai.assert;
// const exact = require('../exact/conection').exact;
const Contact = require('../exact/contact');
const Account = require('../exact/account');


describe('exact - contact', async () => {
  let ACCOUNT = 'a2fce85c-0086-440e-bc01-36eb89346b9f';
  it('create user and remove it', async() => {
    let ContactModel = new Contact();
    let johnId = await ContactModel.create({FirstName: 'Joe', LastName: 'Master', Account: ACCOUNT});
    assert.equal(typeof johnId, 'string');

    let john = await ContactModel.findById(johnId);
    assert.isTrue(john !== false);
    assert.equal(john.LastName, 'Master');

    await ContactModel.update(johnId, {LastName: 'Buddha'});
    john = await ContactModel.findById(johnId);
    assert.isTrue(john !== false);
    assert.equal(john.LastName, 'Buddha');

    await ContactModel.delete(johnId);
  })
});

describe('exact - account', () => {
  // let ACCOUNT = 'a2fce85c-0086-440e-bc01-36eb89346b9f';
  it('create account', async() => {
    let AccountModel = new Account();
    let masterId = await AccountModel.create({Name: 'Master'});
    assert.equal(typeof masterId, 'string');

    let master = await AccountModel.findById(masterId);
    assert.isTrue(master !== false);
    assert.equal(master.Name, 'Master');

    await AccountModel.update(masterId, {Name: 'Buddha Sir'});
    master = await AccountModel.findById(masterId);
    assert.isTrue(master !== false);
    assert.equal(master.Name, 'Buddha Sir');

    await AccountModel.delete(masterId);
  })
});
