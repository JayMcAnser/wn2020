/**
 * Test the carrier model
 */

const Db = require('./init.db').DbMongo;
const chai = require('chai');
const assert = chai.assert;
const Test = require('../model/test');
const Code = require('../model/code');

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
    rec.flexAdd({related: test1, title: 'base 2', name: 'Related name'});
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
  });

  it('has codes', async () => {
    let c1 = await Code.findOne({guid: 'TEST_CODE_1'});
    if (!c1) {
      c1 = await Code.create({guid: 'TEST_CODE_1', text: 'test 1'});
      await c1.save();
      c1 = await Code.findOne({guid: 'TEST_CODE_1'});
    }
    let c2 = await Code.findOne({guid: 'TEST_CODE_2'});
    if (!c2) {
      c2 = await Code.create({guid: 'TEST_CODE_2', text: 'test 2'});
      await c2.save();
      c2 = await Code.findOne({guid: 'TEST_CODE_2'});
    }
    assert.equal(c1.text, 'test 1');
    assert.equal(c2.text, 'test 2');
    let test = Test.create({testId: 5, locationNumber: 'e0001', name: 'has codes'});
    let rec = await test.save();
    test.codeArray.push(c1);
    test.codeArray.push(c2);
    await test.save();
    rec = await Test.findOne({testId: 5});
    assert.equal(rec.codeArray.length, 2);
    assert.equal(rec.codeArray[0].toString(), c1.id.toString());
    rec = await Test.findOne({testId: 5})
      .populate('codeArray');
    assert.equal(rec.codeArray.length, 2);
    assert.equal(rec.codeArray[0].text, c1.text);

    let obj = rec.objectGet();
    assert.equal(obj.codeArray.length, 2);
    assert.equal(obj.codeArray[0].text, c1.text);
  });

  it('has calculated fields', async () => {
    let rec = Test.create({testId: 6, type: 'calculating', locationNumber: 'f0001', name: 'virtuals'});
    rec = await rec.save();
    rec = await Test.findOne({testId: 6});
    assert.equal(rec.testId, 6);
    let obj = rec.objectGet();
    assert.equal(obj.getValue, 'calculating is set');


    rec.objectSet({name: 'virtuals 2', locationNumber: 'f00002'});
    rec = await rec.save();
    rec = await Test.findOne({testId: 6});
    obj = rec.objectGet();
    assert.equal(obj.name, 'virtuals 2');
    assert.equal(obj.locationNumber, 'f00002');

    // test the setValue
    rec.objectSet({setValue: 'did it'});
    rec = await rec.save();
    rec = await Test.findOne({testId: 6});
    obj = rec.objectGet();
    assert.equal(obj.setValue, 'the value was did it')
  })

});
