/**
 * Test the carrier model
 */

const Db = require('./init.db').DbMongo;
const chai = require('chai');
const assert = chai.assert;
const Carrier = require('../model/carrier');
const Art = require('../model/art');
const Code = require('../model/code');
const Session = require('../lib/session');

describe('model.carrier', function () {
  this.timeout(5000);
  let session = new Session('test.model.carrier');
  before( () => {
    return Carrier.deleteMany({}).then( () => {
      return Art.deleteMany({}).then( () => {
        return Code.deleteMany({})
      })
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
    let carrier = Carrier.create(session, {carrierId: 2, locationNumber: 'b1234'});
    let art = Art.create(session, {artId: 22, title: 'The 22 works'});
    art = await art.save();

    await carrier.artAdd({art: art, source: 'the source'});
    await carrier.save();
    return await Carrier.findOne({carrierId: 2})
      .populate('artwork.art')
      .then( (obj) => {
        assert.equal(obj.carrierId, 2);
        assert.isDefined(obj.artwork, 'has link to art');
        assert.equal(obj.artwork.length, 1);
        assert.equal(obj.artwork[0].source, 'the source');
        assert.equal(obj.artwork[0].art.title, 'The 22 works');
      })
  });

  describe('codes', () => {
    it('create one', async() => {
      let carrier = Carrier.create(session, {carrierId: 3, locationNumber: 'c3'});
      carrier  = await carrier.save();
      let code = Code.create(session, {codeId: 1, text:'carrier code'})
      code = await code.save();
      assert.isDefined(code.codeId);
      carrier.codeAdd(code);
      await carrier.save();
      carrier = await Carrier.findOne({carrierId : 3})
        .populate('codes');
      assert.equal(carrier.codes.length, 1);
      assert.equal(carrier.codes[0].text, 'carrier code');
    });

    it('add code on create', async() => {
      let code = Code.create(session, {codeId: 2, text:'carrier code 2'});
      code = await code.save();
      let carrier = Carrier.create(session, {carrierId: 4, locationNumber: 'c4', codes:[code]});
      carrier  = await carrier.save();
      carrier.codeAdd(code);
      carrier = await Carrier.findOne({carrierId : 4})
        .populate('codes');
      assert.equal(carrier.codes.length, 1);
      assert.equal(carrier.codes[0].text, 'carrier code 2');
    });
  });
  describe('carrier => art', async () => {
    let art;
    let carrier;
    let code;
    it('add code', async () => {
      art = Art.create(session, {artId: 4, title: 'The 4 works'});
      art = await art.save();
      code = Code.create(session, {codeId: 4, text:'carrier to art of 4'});
      code = await code.save();
      carrier = Carrier.create(session, {carrierId: 5, locationNumber: 'c5'});
      carrier  = await carrier.save();
      carrier.artAdd({art: art, source:'number 4', artCodes:[code]});
      await carrier.save();
      carrier = await Carrier.findOne({carrierId: 5})
        .populate('artwork.art')
        .populate('artwork.artCodes');

      assert.isDefined(carrier.artwork);
      assert.equal(carrier.artwork.length, 1);
      assert.equal(carrier.artwork[0].artCodes.length, 1);
      assert.equal(carrier.artwork[0].artCodes[0].text, 'carrier to art of 4');
    });
    it('add code in one run', async() => {
      carrier = Carrier.create(session, {carrierId: 6, locationNumber: 'c6', artwork: [{art: art, source:'number 4', artCodes:[code]}]});
      carrier  = await carrier.save();
      carrier = await Carrier.findOne({carrierId: 6})
        .populate('artwork.art')
        .populate('artwork.artCodes');
      assert.isDefined(carrier.artwork);
      assert.equal(carrier.artwork.length, 1);
      assert.equal(carrier.artwork[0].artCodes.length, 1);
      assert.equal(carrier.artwork[0].artCodes[0].text, 'carrier to art of 4');
    })
  })
});
