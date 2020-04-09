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

  let account = false;
  let newId= false;

  describe('contact - get', () => {
    let id = false;
    let name = false;

    it('random', async () => {
      let contacts = await exact.get('/crm/Contacts');
      assert.isTrue(contacts.length > 0, 'found contacts');
      assert.isDefined(contacts[0].LastName);
      assert.isDefined(contacts[0].FirstName);
      assert.isDefined(contacts[0].ID);
      assert.isTrue(contacts[0] !== null);
      assert.isTrue(typeof contacts[0].ID === 'string');
      assert.isTrue(contacts[0].ID.length > 0)
      id = contacts[0].ID;
      name = contacts[0].LastName;
      account = contacts[0].Account;
      // console.log('contact', contact)
    });
    it('filter fields', async () => {
      let contacts = await exact.get('/crm/Contacts?$select=LastName');
      assert.isTrue(contacts.length > 0, 'found contacts');
      assert.isDefined(contacts[0].LastName);
      assert.isUndefined(contacts[0].FirstName);
    });
    it('find by id', async() => {
      let contacts = await exact.get('/crm/Contacts?$filter=ID eq guid\'' + id + '\'');
      assert.isTrue(contacts.length > 0, 'found contacts');
      assert.equal(contacts[0].LastName, name);
    });
    it('find by name', async() => {
      let contacts = await exact.get('/crm/Contacts?$filter=LastName eq \'' + name + '\'');
      assert.isTrue(contacts.length > 0, 'found contacts');
      assert.equal(contacts[0].LastName, name);
    });
  });

  describe('contact - post', () => {
    let id = false;
    it('create', async() => {
      let result = await exact.post('crm/Contacts', {
        Account: account,
        FirstName: 'John',
        LastName: 'Doe'
      });
      assert.isTrue(typeof result === 'string');
      newId = result;
      let contact = await exact.get(`crm/Contacts?$filter=ID eq guid'${newId}'`);
      assert.equal(contact[0].LastName, 'Doe');
      assert.equal(contact[0].FirstName, 'John');
    });
  });

  describe('contact - put', () => {
    let id = false;
    it('update required fields', async() => {
      let result = await exact.put(`crm/Contacts(guid'${newId}')`, {
        FirstName: 'Johnny',
        LastName: 'Doe'
      });
      assert.isTrue(result );
      let contact = await exact.get(`crm/Contacts?$filter=ID eq guid'${newId}'`);
      assert.equal(contact[0].LastName, 'Doe');
      assert.equal(contact[0].FirstName, 'Johnny');
    });
  });

  describe('contact - delete', () => {
    let id = false;
    it('remove new one', async() => {
      let result = await exact.delete(`crm/Contacts(guid'${newId}')`);
      assert.isTrue(result );
      let contacts = await exact.get(`crm/Contacts?$filter=ID eq guid'${newId}'`);
      assert.equal(contacts.length, 0, 'did not find it');
    });
  })
});
