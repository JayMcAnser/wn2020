/**
 * Test the code model
 */

const Db = require('./init.db');
const DbMySql = Db.DbMySQL;
const DbMongo = Db.DbMongo;
const chai = require('chai');
const assert = chai.assert;
const ImportCode = require('../import/codes');
const Code = require('../model/code');
const Setup = require('../lib/setup');

describe('import.code', function() {

  let mySQL;
  before(() => {
    return Code.deleteMany({}).then(() => {
      return DbMySql.connect().then((con) => {
        mySQL = con;
        let setup = new Setup();
        return setup.run();
      })
    })
  });

  it('check field information', () => {
    let record =
      {
        "code_ID": 1,
        "code_GUID": "guid",
        "group_ID": 2,
        "parent_ID": 3,
        "basegroup_ID": 4,
        "use_code_ID": 5,
        "type_ID": 6,
        "fieldtype_ID": 7,
        "is_default": 1,
        "text": "text",
        "text_nl": "text nl",
        "use_description": 1,
        "description": "description",
        "description_nl": "description nl",
        "short": "short",
        "group_on": "group on",
        "sort_on": "sort on",
        "sort_on_nl": "sort on nl",
        "not_used": 1,
      };
    let imp = new ImportCode();
    return imp.runOnData(record).then( (mRec) => {
      let obj = mRec.objectGet();
      assert.equal(obj.codeId, 1);
      assert.equal(obj.guid, 'guid');
      assert.equal(obj.groupId, 2);
      assert.equal(obj.parentId, 3);
      assert.equal(obj.baseGroupId, 4);
      assert.equal(obj.useCodeId, 5);
      assert.equal(obj.typeId, 6);
      assert.equal(obj.fieldTypeId, 7);
      assert.equal(obj.isDefault, true);
      assert.equal(obj.text, 'text');
      assert.equal(obj.textNl, "text nl");
      assert.equal(obj.description, "description");
      assert.equal(obj.descriptionNl, 'description nl');
      assert.equal(obj.short, 'short');
      assert.equal(obj.groupOn, 'group on');
      assert.equal(obj.sortOn, 'sort on');
      assert.equal(obj.sortOnNl, 'sort on nl');
      assert.equal(obj.notUsed, 1)
    });
  });
});
