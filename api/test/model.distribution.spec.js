/**
 * Test the distribution model
 */

const Db = require('./init.db').DbMongo;
const chai = require('chai');
const assert = chai.assert;
const Distribution = require('../model/distribution');
const Config = require('config');

describe('model.distribution', () => {

  before( () => {
    return Distribution.deleteMany({})
  });


});
