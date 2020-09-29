/**
 * Test the EndPoint interface of exact
 */

const init = require('./init');
const chai = require('chai');
const assert = chai.assert;
const exact = require('../exact/exact-conection').exact;
const Contact = require('../exact/contact');

describe('exact - contact', function() {

  let newId = false;
  let account = false;

  before( async () => {
    // we need any account. This is the quick and dirty way
    /*
      If this does not work, we must log in to Exact. That can not be done in the test but must be done from
      the browser.
      THe current url: https://start.exactonline.nl/api/oauth2/auth?client_id=ddc28ab0-dc93-4478-96a3-7495a7ea174e&redirect_uri=http://localhost:3000/exact&response_type=code&force_login=0
      should be used with the user and password of exact.
      Exact will call localhost:3000/exact

      To accept the awnser call back from exact, run node index.js

      Restart the server to update the definition

     */
    let contacts = await exact.get('/crm/Contacts');
    assert.isTrue(contacts.length > 0, 'found contacts');
    account = contacts[0].Account;
  })


  it('create', async () => {
    let contact = Contact.create({
      account: account,
      firstName: 'John B.',
      lastName: 'Doe'
    });
    assert.isTrue(contact.isNew);
    await contact.save();
    assert.isFalse(contact.isNew);
    newId = contact.id;
  });

  it('findById', async () => {
    let contact = await Contact.findById(newId);
    assert.equal(typeof contact.id, 'string');
    assert.equal(contact.lastName, 'Doe');
  })

  it('update', async() => {
    let contact = await Contact.findById(newId);
    assert.equal(typeof contact.id, 'string');
    assert.equal(contact.lastName, 'Doe');
    contact.lastName = 'Done it';
    await contact.save();
    contact = await Contact.findById(newId);
    assert.equal(contact.lastName, 'Done it');
  })

  it('update - error field does not exist', async() => {
    let contact = await Contact.findById(newId);
    assert.equal(contact.lastName, 'Done it');
    contact.notAField = 'Some value';
    try {
      await contact.save();
      assert.fail('Should throw an error')
    } catch (e) {
      assert.equal(e.message, 'Error processing request stream. The property name \'NotAField\' specified for type \'Exact.Web.Api.Models.Contact\' is not valid.')
    }
  })

  // it('find', async() => {
  //   let contacts = await Contact.find({LastName: { gt: 'B'}});
  //   assert.isTrue(contact.length > 0);
  //
  // })
  it('delete', async() => {
    let contact = await Contact.findById(newId);
    assert.equal(typeof contact.id, 'string');
    await contact.delete();
    contact = await Contact.findById(newId);
    assert.equal(contact, false)
  })
});
