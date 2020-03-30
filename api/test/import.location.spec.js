/**
 * Test the distribution model
 */

const Db = require('./init.db');
const DbMySql = Db.DbMySQL;
const DbMongo = Db.DbMongo;
const chai = require('chai');
const assert = chai.assert;
const ImportLocation = require('../import/locations');
const Distribution = require('../model/distribution');
const Address = require('../model/address');
const Carrier = require('../model/carrier');
const Setup = require('../lib/setup');

describe('import.location', function() {
  this.timeout(5000);

  let mySQL;
  before( () => {
    return Distribution.deleteMany({}).then( () => {
      return Address.deleteMany({}).then( () => {
        return Carrier.deleteMany({}).then( () => {
          return DbMySql.connect().then((con) => {
            mySQL = con;
            let setup = new Setup()
            return setup.run();
          })
        })
      })
    })
  });

  it('check field information', () => {
    let imp = new ImportLocation();
    let record = {
      "location_ID": 1,
      "objecttype_ID": 7000,
      "location_code": "2005-0001",
      "invoice_number": "112233",
      "contact_address_ID": 11272,
      "contact_address_name": "contact name",
      "invoice_address_ID": 11272,
      "invoice_address_name": "invoice name",
      "mail_address_ID": 11272,
      "intro_text": "intro text",
      "event": "event text",
      "footer_text": "footer text",
      "sub_total": "10,00",
      "sub_total_txt": "0,00",
      "btw": "21",
      "btw_txt": "0,00",
      "shipping_costs": "2,00",
      "shipping_costs_txt": "0,00",
      "other_costs": "3,00",
      "other_costs_txt": "0,00",
      "total_amount": "0",
      "total_amount_txt": "0,00",
      "rental_date": "2005-01-03",
      "end_of_event_date": "2005-01-05",
      "returned_on_date": "2005-01-07",
      "handled_by_ID": 5,
      "collected_by_ID": 0,
      "returned": 1,
      "sys_creation_date": "2005-01-25",
      "sys_modified_date": "2011-09-27",
      "sys_creation_user_ID": 5,
      "screening_date": "2005-02-15 00:00:00",
      "btw_prc": 19,
      "year": null,
      "sys_modified_user_ID": 3,
      "is_blocked": "0",
      "start_date": null,
      "end_date": null,
      "username": null,
      "password": null,
      "production_costs": "4.00",
      "production_costs_txt": "4,00",
      "is_rental": 1
    };
    return imp.runOnData(record).then( (mRec) => {
      let obj = mRec.objectGet();
      assert.equal(obj.locationId, 1);
      assert.equal(obj.code, '2005-0001');
      assert.equal(obj.invoiceNumber, '112233');
      // must check the popupate of the address
      assert.equal(obj.contactName, 'contact name');
      assert.equal(obj.invoiceName, 'invoice name');
      assert.equal(obj.header, 'intro text');
      assert.equal(obj.event, 'event text');
      assert.equal(obj.footer, 'footer text');
      assert.equal(obj.vat, 19);
      assert.equal(obj.shippingCosts, 200);
      assert.equal(obj.otherCosts, 300);
      assert.equal(obj.productionCosts, 400);
    })
  });

  it('run - clean', () => {
    const limit = 10;
    let imp = new ImportLocation({ limit: limit});
   // assert.isTrue(true);
    return imp.run(mySQL).then( (result) => {
      assert.equal(result.count, limit)
    })
  })
});
