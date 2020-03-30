/**
 * Test the distribution model
 */

const Db = require('./init.db');
const DbMySql = Db.DbMySQL;
const DbMongo = Db.DbMongo;
const chai = require('chai');
const assert = chai.assert;
const ImportCarrier = require('../import/carriers');
const Carrier = require('../model/carrier');
const Setup = require('../lib/setup');

describe('import.carrier', function() {
  this.timeout('10000');

  let mySQL;
  before(() => {
    return Carrier.deleteMany({}).then(() => {
      return DbMySql.connect().then((con) => {
        mySQL = con;
        let setup = new Setup();
        return setup.run();
      })
    })
  });

  it('check field information', () => {
     let record = {
      "carrier_ID": 1,
      "objecttype_ID": 16,
      "location_number": "loc-nr",
      "searchcode": "search code",
      "creation_date": "1991-01-01",
      "modified_date": "1992-01-02 17:29:29",
      "comments": "comments",
      "collection_number": "col-nr",
      "technical_comments": "tech-com",
      "compression_rate": "compression rate",
      "created_from": "create from",
      "recommend": "recommend",
      "conservation_fase": 1,
      "ascpectratio": "aspec",
      "videocodec": "v-code",
      "size": "size",
      "muxrate": "mux",
      "FPS": "fps",
      "audiocodec": "acodec",
      "audiotype": "atype",
      "audiorate": "arate",
      "modification": "mods",
      // "creation_user_ID": 0,
      // "file_path_ID": 0,
      "filename": "filename",
      //"check": "",
      "prefix": "pref",
      "loc_number": "loc-nr2",
      // "internal_agent_ID": 2022,
      // "internal_art_ID": 486,
      // "internal_doc_ID": null,
      "extension": "ext",
      "tmp_filename": "tmp-filename",
      "lto_tape_number": "lto-tape-nr",
      "lto_position_number": "lto-pos-nr",
      "file_md5": "md5",
      "view_rating_website": 2
    };
    let imp = new ImportCarrier();
    return imp.runOnData(record).then( (mRec) => {
      let obj = mRec.objectGet();
      assert.equal(obj.type, "tape");
      assert.equal(obj.locationNumber, 'loc-nr');
      assert.equal(obj.searchCode, 'search code');
      // dates dont work assert.equal(obj.creationDate, '1991-01-01');
      // assert.equal(obj.mutationDate, '1992-01-02 17:29:29');
      assert.equal(obj.comments, 'comments');
      assert.equal(obj.collectionNumber, 'col-nr');
      assert.equal(obj.technicalComments, 'tech-com');
      assert.equal(obj.recommend, 'recommend');
      assert.equal(obj.conservationPhase, 1);
      assert.equal(obj.aspectRatio, "aspec");
      assert.equal(obj.videoCodec, "v-code");
      assert.equal(obj.size, "size");
      assert.equal(obj.muxRate, 'mux');
      assert.equal(obj.fps, 'fps');
      assert.equal(obj.audioCodec, 'acodec');
      assert.equal(obj.audioType, 'atype');
      assert.equal(obj.audioRate, 'arate');
      assert.equal(obj.modifications, 'mods');
      assert.equal(obj.compressionRate, "compression rate");
      assert.equal(obj.fileName, "filename");
      assert.equal(obj.filePath, "tmp-filename");
      assert.equal(obj.fileLocationNumber, 'loc-nr2');
      assert.equal(obj.extension, 'ext');
      assert.equal(obj.ltoTapeNumber, 'lto-tape-nr');
      assert.equal(obj.ltoPositionNumber, 'lto-pos-nr');
      assert.equal(obj.ltoMd5, 'md5');
      assert.equal(obj.viewRating, 2);
    })
  });

  it('run - clean', () => {
    const limit = 10;
    let imp = new ImportCarrier({ limit: limit});
    assert.isTrue(true);
    return imp.run(mySQL).then( (result) => {
      assert.equal(result.count, limit)
    })
  })
});
