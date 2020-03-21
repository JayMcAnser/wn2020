/**
 * Test the user model
 */

const Db = require('./init.db').DbMongo;
const chai = require('chai');
const assert = chai.assert;
const ArtFlex = require('../model/art-flex');
const Address = require('../model/address');
const Setup = require('../lib/setup');

describe('model.art-flex', () => {

  before( () => {
    return ArtFlex.deleteMany({}).then(() => {
      let setup = new Setup();
      return setup.run();
    });
  });

  let art;
  it('create', () => {
    return ArtFlex.create({artId: 1}).then( (c) => {
      art = c;
      return ArtFlex.create({
        title: 'other one', artId: 99}
        ).then((r) => {
          let o = r.objectGet();
          assert.equal(o.title,'other one', 'on the virtual record');
          assert.equal(o.artId, 99, 'on the base record')
      })
    })
  });
  it('get / set object', async () => {
    art.objectSet({title: 'the title', yearFrom: '1999'});
    let a = await art.save();
    let obj = a.objectGet();
    assert.equal(obj.title, 'the title');
    assert.equal(obj.yearFrom, '1999');
    assert.isUndefined(obj.notFound);

    obj = a.objectGet(['title']);
    assert.equal(obj.title, 'the title');
    assert.isUndefined(obj.yearFrom);

    art.objectSet({title: 'the title 2'});
    obj = a.objectGet();
    assert.equal(obj.title, 'the title 2', 'update the title');
    assert.equal(obj.yearFrom, '1999');

    art.objectSet({title: undefined});
    obj = a.objectGet();
    assert.isUndefined(obj.title, 'removed because of undefined');

    art.objectSet({noField: 'not save'});
    obj = a.objectGet();
    assert.isUndefined(obj.noField, 'not stored because not in FieldMap');

    art.objectSet({isPartOfCollection: true});
    obj = a.objectGet();
    assert.isTrue(obj.isPartOfCollection, 'type of data is stored');

    a = await art.save();
    obj = a.objectGet();
    assert.isUndefined(obj.title, 'did store the remove');
  });

  it('cacluate field', async() => {
    art.objectSet({title: 'the title', yearFrom: '1999', yearTill: '2000'});
    let a = await art.save();
    let obj = a.objectGet();
    assert.equal(obj.title, 'the title');
    assert.equal(obj.yearFrom, '1999');
    assert.equal(obj.period, '1999 - 2000');
    a.objectSet({yearTill: undefined});
    obj = a.objectGet();
    assert.equal(obj.period, '1999');
  });

  it('local and _field', async() => {
    let rec = await ArtFlex.create({title: 'number 2', artId: 2});
    await rec.save();
    rec = await ArtFlex.find({artId: 1});
    assert.equal(rec.length, 1);

    rec = await ArtFlex.find({'_fields.string' : '1999', '_fields.def' : 'yearFrom'});
    assert.equal(rec.length, 1);

    rec = await ArtFlex.findField({yearFrom: '1999'});
    assert.equal(rec.length, 1);

  });

  it('test ref', async () => {
    let rec = await ArtFlex.create({title: 'number 8', artId: 8});
    let addr1 = await Address.create({addressId: 101, name: 'ad 101'});
    let addr2 = await Address.create({addressId: 102, name: 'ad 102', department: 'xx'});
    let addr3 = await Address.create({addressId: 103, name: 'ad 103', department: 'yy'} );

    rec.work = {addr: addr1._id, number: 11};
    await rec.save();
    return ArtFlex.find({artId: 8})
      .populate('work.addr')
      .then( async (r) => {
        // assert.equal(r.work.name, 'ad 103');
        assert.equal(r[0].work.addr.name, 'ad 101');
        assert.equal(r[0].work.number, 11);

        rec.multi.push({addr: addr2._id, number: 22});
        rec.multi.push({addr: addr3._id, number: 33});
        await rec.save();
        return ArtFlex.find({artId: 8})
          .populate('multi.addr')
          .then((r) => {
            // assert.equal(r.work.name, 'ad 103');
            assert.equal(r[0].multi[0].addr.name, 'ad 102');
            assert.equal(r[0].multi[0].number, 22);
            assert.equal(r[0].multi.length, 2, 'both address');
            assert.equal(r[0].multi[1].addr.name, 'ad 103');
          });

    });
  })
});
