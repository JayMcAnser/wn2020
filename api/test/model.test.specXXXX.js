/**
 * Test the carrier model
 */

const Db = require('./init.db').DbMongo;
const chai = require('chai');
const assert = chai.assert;
const Test = require('../model/test');
const Code = require('../model/code');

describe('model.test', () => {

  let c1;
  let c2;
  let c3;

  before( () => {
    return Test.deleteMany({}).then( () => {
      return Code.deleteMany({})
    })
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

  describe('has codes', async () => {
    let rec;
    let test;
    let obj;

    before( async () => {
      c1 = await Code.findOne({codeId: 1});
      if (!c1) {
        c1 = await Code.create({codeId: 1, guid: 'TEST_CODE_1', text: 'test 1'});
        await c1.save();
        c1 = await Code.findOne({codeId: 1});
      }
      c2 = await Code.findOne({codeId: 2});
      if (!c2) {
        c2 = await Code.create({codeId: 2, guid: 'TEST_CODE_2', text: 'test 2'});
        await c2.save();
        c2 = await Code.findOne({codeId: 2});
      }
      c3 = await Code.findOne({codeId: 3});
      if (!c3) {
        c3 = await Code.create({codeId: 3, guid: 'TEST_CODE_3', text: 'test 3'});
        await c3.save();
        c3 = await Code.findOne({codeId: 3});
      }
    });
    it('add codes', async() => {
      let obj1 = c1.objectGet();
      assert.equal(obj1.text, 'test 1');
      let obj2 = c2.objectGet();
      assert.equal(obj2.text, 'test 2');
      test = Test.create({testId: 5, locationNumber: 'e0001', name: 'has codes'});

      rec = await test.save();
      test.codeArray.push(c1);
      test.codeArray.push(c2);
      await test.save();
      rec = await Test.findOne({testId: 5});
      assert.equal(rec.codeArray.length, 2);
      assert.equal(rec.codeArray[0].toString(), c1.id.toString());
      rec = await Test.findOne({testId: 5})
        .populate('codeArray');
      assert.equal(rec.codeArray.length, 2);
      assert.equal(rec.codeArray[0].codeId, obj1.codeId);
      obj = rec.objectGet();
      assert.equal(obj.codeArray.length, 2);
      assert.equal(obj.codeArray[0].text, obj1.text);
    });
    it('replace array', async() => {
      rec.objectSet({codeArray: [c3]});
      let obj3 = c3.objectGet();
      await rec.save();
      rec = await Test.findOne({testId: 5})
        .populate('codeArray');
      let obj = rec.objectGet()
      assert.equal(obj.codeArray.length, 1);
      assert.equal(obj.codeArray[0].text, obj3.text);
    })
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
    assert.equal(obj.setValue, 'the value was did it');

    // test remove of calculated field
    rec.objectSet({toggleRemove: 'waarde'});
    rec = await rec.save();
    rec = await Test.findOne({testId: 6});
    obj = rec.objectGet();
    assert.equal(obj.toggleRemove, 'waarde');

    rec.objectSet({toggleRemove: false}); // false is just the function trigger
    rec = await rec.save();
    rec = await Test.findOne({testId: 6});
    obj = rec.objectGet();
    assert.isUndefined(obj.toggleRemove);
  });

  describe('id field', () => {
    let rec;
    let obj;
    let id;
    it('has id', async() => {
      rec = Test.create({testId: 7, type: 'calculating', locationNumber: 'g0001', name: 'id field'});
      rec = await rec.save();
      rec = await Test.findOne({testId: 7});
      assert.equal(rec.testId, 7);
      obj = rec.objectGet();
      assert.isDefined(obj.id);
      id = obj.id;
    });

    it('save including id', async () => {
      obj.locationNumber = 'g0002';
      obj.name = 'id field 2';
      obj.id = '123456789012';
      rec.objectSet(obj);
      rec = await rec.save();
      rec = await Test.findOne({testId: 7});
      obj = rec.objectGet();
      assert.equal(obj.name, 'id field 2');
      assert.equal(obj.locationNumber, 'g0002');
      assert.equal(obj.id, id, 'does not change the id')
    });

    it('array field with objects', async() => {
      rec.flexAdd({title: 'the title', name: 'find id'});
      rec = await rec.save();
      rec = await Test.findOne({testId: 7});
      obj = rec.objectGet();
      assert.equal(obj.flexArray.length, 1);
      assert.isDefined(obj.flexArray[0].id)
    });

    it('code array', async() => {
      rec.codeArray.push(c1);
      rec = await rec.save();
      rec = await Test.findOne({testId: 7})
        .populate('codeArray');
      obj = rec.objectGet();
      assert.equal(obj.codeArray.length, 1);
      assert.isDefined(obj.codeArray[0].id)
    })
  })
});
