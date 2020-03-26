/**
 * Test the carrier model
 */

const Db = require('./init.db').DbMongo;
const chai = require('chai');
const assert = chai.assert;
const Carrier = require('../model/carrier');
const Art = require('../model/art');
const Config = require('config');

describe('model.carrier', () => {

  before( () => {
    return Carrier.deleteMany({})
  });

  // it('create', async() => {
  //   let carrier = Carrier.create({carrierId: 1, locationNumber: 'a0001-123'});
  //   let rec = await carrier.save();
  //   let obj = rec.objectGet();
  //   assert.equal(obj.carrierId, 1, 'root field');
  //   assert.equal(obj.locationNumber, 'a0001-123', 'virtual field')
  // });

  it('create', async() => {
    let carrier = Carrier.create({carrierId: 2, locationNumber: 'b1234'});
    let art = Art.create({artId: 22, title: 'The 22 works'});
    art = await art.save();
    // carrier.theArt.def = 'related';
    // carrier.theArt.related = art;
    // carrier.theArt.onModel = 'Art';
    // carrier.markModified('theArt');
    carrier.theArt.related = art;
    await carrier.artAdd({art: art, source: 'this', extra:'some info'});
    await carrier.save();
    return await Carrier.findOne({carrierId: 2})
      // .populate('_fields')
      // .populate('artwork._fields');
      .populate('theArt.related')
      .populate('artwork._fields.related').then( (rec) => {
        let obj = rec.objectGet();
        assert.equal(obj.carrierId, 2);
        assert.equal(obj.art.length, 1);
        assert.equal(obj.art[0].source, 'this')
      })
  });

});
