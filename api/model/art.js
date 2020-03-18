/**
 * Art
 */
const Mongoose = require('../lib/db-mongo');
const Schema = Mongoose.Schema;


const FieldSchema = {
  label: {
    type: String,
    required: true
  },
  group: {
    type: String,
    required: true
  },
  text: String,
  bool: Boolean,
  count: Number
};


const ArtSchema = {
  artId: String, // the id in watsnext
  type: {
    type: String,
    required: true,
    enum: ['Video', 'Installation', 'Channel', 'Unknown']
  },
  searchcode: String,
  title: {
    type: String,
    required: true
  },
  titleEn: {
    type: String,
    required: true
  },
  comments: String,
  sortOn: String,
  isPartOfCollection: Boolean,
  yearFrom: {
    type: String,
  },
  yearTill: {
    type: String
  },
  length: String,
  description: String,
  descriptionEn: String,
  hasSound: Boolean,
  audio: String,
  credits: String,

  fields: [FieldSchema]
};

let ArtModel = new Schema(ArtSchema);


module.exports = Mongoose.Model('Art', ArtModel);
