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
  it('delete', async() => {
    let contact = await Contact.findById(newId);
    assert.equal(typeof contact.id, 'string');
    await contact.delete();
    contact = await Contact.findById(newId);
    assert.equal(contact, false)
  })
});
