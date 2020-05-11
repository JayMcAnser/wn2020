/**
 * A flex carrier model where the field can be define on-the-fly
 *
 */
const Mongoose = require('../lib/db-mongo');
const Schema = Mongoose.Schema;
const ArtFieldMap = require('./art').FieldMap;
const CodeFieldMap = require('./code').ShortFieldMap;
const UndoHelper = require('mongoose-undo');

let ArtSchema = new Schema({
  art: {
    type: Schema.Types.ObjectId,
    ref: 'Art'
  },
  startTime: String,
  endTime: String,
  source: String,
  collectionNumber: String,
  locationNumber: String,
  videoCorrection: String,
  audioCorrection: String,
  technicalComments: String,
  videoGain: String,
  videoBlack: String,
  videoChroma: String,
  audioLeft: String,
  audioRight: String,
  artCodes: [{
    type: Schema.ObjectId,
    ref: 'Code'
  }]
});

/**
 * carrier record
 */
const CarrierLayout = {
  carrierId: String,        // the org carrier id in WatsNext
  type: String,
  locationNumber: String,
  searchCode: String,
  creationDate: Date,
  mutationDate: Date,
  comments: String,
  collectionNumber: String,
  technicalComments: String,
  recommend: String,
  compressionRate: String,
  conservationPhase: Number,
  aspectRatio: String,
  fileName: String,
  filePath: String,
  fileLocationNumber: String,
  videoCodec: String,
  size: String,
  muxRate: String,
  fps: String,
  audioCodec: String,
  audioType: String,
  audioRate: String,
  modifications: String,
  extension: String,
  ltoTapeNumber: String,
  ltoPositionNumber: String,
  ltoMd5: String,
  viewRating: Number,

  // new fields:
  noArt: Boolean,
  artwork: [ArtSchema],     // the art in / on this carrier
  codes: [{
    type: Schema.ObjectId,
    ref: 'Code'
  }],
  created: UndoHelper.createSchema,
};

let CarrierSchema = new Schema(CarrierLayout);
CarrierSchema.plugin(UndoHelper.plugin);

/**
 * sh
 * @param data could be an Carrier or a full record
 *
 */
CarrierSchema.methods.artAdd = function(data) {
  if (data.art) {
    // it's a full record
    this.artwork.push(data);
  } else {
    let dataRec = { art: data}
    this.artwork.push(data);
  }
};

/**
 * update an
 * @param id
 * @param data
 */
CarrierSchema.methods.artUpdate = function(id, data) {
  if (typeof index !== 'number') {
    for (ind = 0; ind < this.artwork.length; ind++) {
      if (index.toString() === this.artwork[ind].toString()) {
        break;
      }
    }
  }
}



module.exports = Mongoose.Model('Carrier', CarrierSchema);
