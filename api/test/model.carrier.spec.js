/**
 * Test the carrier model
 */

const Db = require('./init.db').DbMongo;
const chai = require('chai');
const assert = chai.assert;
const Carrier = require('../model/carrier');
const Config = require('config');

describe('model.carrier', () => {

  before( () => {
    return Carrier.deleteMany({})
  });

});
