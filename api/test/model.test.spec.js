/**
 * Test the carrier model
 */

const Db = require('./init.db').DbMongo;
const chai = require('chai');
const assert = chai.assert;
const Test = require('../model/test');

describe('model.test', () => {

  before( () => {
    return Test.deleteMany({})
  });

  it('create', async() => {
    let test = Test.create({testId: 1, name: 'record nr 1', locationNumber: 'a0001'});
    let rec = await test.save();
    let obj = rec.objectGet();
    assert.equal(obj.testId, 1, 'root field');
    assert.equal(obj.locationNumber, 'a0001', 'virtual field');
    rec.objectSet({locationNumber: 'a0002'});
    rec = await rec.save();
    obj = rec.objectGet();
    assert.equal(obj.locationNumber, 'a0002', 'virtual field');
  });

  it('relate base record including data', async() => {
    let test1 = await Test.findOne({testId: 1});
    let test = Test.create({testId: 2, locationNumber: 'b0001'});
    let rec = await test.save();
    let obj = rec.objectGet();
    assert.equal(obj.testId, 2, 'root field');
    assert.equal(obj.locationNumber, 'b0001', 'virtual field');
    rec.objectSet({baseRef: test1});
    await test.save();

    rec = await Test.findOne({testId: 2})
       .populate('baseRef');
    assert.isDefined(rec.baseRef);
    assert.equal(rec.baseRef.testId, 1, 'record has been included');

    obj = rec.objectGet();
    assert.equal(obj.baseRef.testId, 1, 'did get the value')
  });


  it('related - flexModel', async() => {
    let test1 = await Test.findOne({testId: 1});
    let test = Test.create({testId: 3, locationNumber: 'c0001', name: 'related - flexModel'});
    let rec = await test.save();
    rec.objectSet({baseFlex:{ related: test1, onModel: 'Test'}});
    test.baseSchema = {title: 'base schema', related: test1};
    await test.save();

    rec = await Test.findOne({testId: 3})
      .populate('baseSchema.related');
    assert.isDefined(rec.baseSchema);
    assert.equal(rec.baseSchema.related.testId, 1, 'record has been included');

    obj = rec.objectGet();
    assert.equal(obj.baseSchema.title, 'base schema', 'did get the value')
    assert.equal(obj.baseSchema.related.name, 'record nr 1', 'did get the value')
  });

  it('related - flexArray', async () => {
    let test1 = await Test.findOne({testId: 1});
    let test = Test.create({testId: 4, locationNumber: 'd0001', name: 'related - flexArray'});
    let rec = await test.save();
    rec.flexAdd({related: test1, title: 'base 2', name: 'Related name'})
    await test.save();

    rec = await Test.findOne({testId: 4})
      .populate('flexArray.related');
    let obj = rec.objectGet();
    assert.equal(obj.testId, 4);
    assert.equal(obj.flexArray.length, 1);
    assert.equal(obj.flexArray[0].title, 'base 2', 'fixed field');
    assert.equal(obj.flexArray[0].name, 'Related name', 'virtual field');
    assert.isDefined(obj.flexArray[0].related);
    assert.equal(obj.flexArray[0].related.testId, 1);
    assert.equal(obj.flexArray[0].related.locationNumber, 'a0002');
   // console.log(obj)
  })


});
