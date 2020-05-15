/**
 * Test the code model
 */

const Db = require('./init.db');
const DbMySql = Db.DbMySQL;
const DbMongo = Db.DbMongo;
const chai = require('chai');
const assert = chai.assert;
const CodeImport = require('../import/code-import');
const Code = require('../model/code');
const Setup = require('../lib/setup');
const Session = require('../lib/session');

describe('import.code', function() {

  let mySQL;
  let session;
  before(() => {
    return Code.deleteMany({}).then(() => {
      return DbMySql.connect().then((con) => {
        session = new Session('test-import-codes')
        mySQL = con;
        let setup = new Setup();
        return setup.run();
      })
    })
  });

  it('check field information', () => {
    let record =
      {
        "code_ID": 9999999,
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
    let imp = new CodeImport({session});
    return imp.runOnData(record).then( (obj) => {
      assert.equal(obj.codeId, 9999999);
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

  it('run - clean', () => {
    const limit = 10;
    let imp = new CodeImport({ session, limit: limit});
    return imp.run(mySQL).then( (result) => {
      assert.equal(result.count, limit)
    })
  })
});
