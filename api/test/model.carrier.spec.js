/**
 * Test the carrier model
 */

const Db = require('./init.db').DbMongo;
const chai = require('chai');
const assert = chai.assert;
const Carrier = require('../model/carrier');
const Art = require('../model/art');

describe('model.carrier', function () {
  this.timeout(5000);

  before( () => {
    return Carrier.deleteMany({}).then( () => {
      return Art.deleteMany({})
    })
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

    await carrier.artAdd({art: art, source: 'the source'});
    await carrier.save();
    return await Carrier.findOne({carrierId: 2})
      .populate('artwork.art')
      .then( (rec) => {
        let obj = rec.objectGet();
        assert.equal(obj.carrierId, 2);
        assert.isDefined(obj.artwork, 'has link to art');
        assert.equal(obj.artwork.length, 1);
        assert.equal(obj.artwork[0].source, 'the source');
        assert.equal(obj.artwork[0].art.title, 'The 22 works');
      })
  });

});
