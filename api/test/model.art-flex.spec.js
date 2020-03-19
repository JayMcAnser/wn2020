/**
 * Test the user model
 */

const Db = require('./init.db').DbMongo;
const chai = require('chai');
const assert = chai.assert;
const ArtFlex = require('../model/art-flex');
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
    return ArtFlex.create({}, {artId: 1}).then( (c) => {
      art = c;

      return ArtFlex.create({
        title: 'other one'
      },{ artId: 99}).then((r) => {
        let o = r.objectGet();
        assert.equal(o.title,'other one');
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
    let rec = await ArtFlex.create({title: 'number 2'}, {artId: 2});
    await rec.save();
    rec = await ArtFlex.find({artId: 1});
    assert.equal(rec.length, 1);

    rec = await ArtFlex.find({'_fields.string' : '1999', '_fields.def' : 'yearFrom'});
    assert.equal(rec.length, 1);

    rec = await ArtFlex.findField({yearFrom: '1999'});
    assert.equal(rec.length, 1);

  });

});
