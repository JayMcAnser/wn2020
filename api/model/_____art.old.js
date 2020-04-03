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

const FieldMap = {
  type: {type: 'string', name: 'code', group: 'general'},
  searchCode: {type: 'string', name: 'search code', group: 'general'},
  title: {type: 'string', name: 'title', group: 'general'},
  titleEn: {type: 'string', name: 'title english', group: 'general'},
  comments: {type: 'string', name: 'comments', group: 'general'},
  sortOn: {type: 'string', name: 'sort on', group: 'general'},
  isPartOfCollection: {type: 'boolean', name: 'is part of collection', group: 'general'},
  yearFrom: {type: 'string', name: 'year from', group: 'general'},
}

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
module.exports.FieldMap = FieldMap;
