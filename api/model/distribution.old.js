/**
 * distribution record
 */

const Mongoose = require('../lib/db-mongo');
const Schema = Mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const Config = require('config');
const ErrorType = require('error-types');


const DistributionSchema = {
  code: {
    type: String,
    trim: true,
    required: [true, 'code is required'],
  },
  locationId: Number,     // number in the mySQLl db
  invoiceNumber: String,

  contactId: ObjectId,
  contactName: String,
  invoiceId: ObjectId,
  invoiceName: String,
  emailId: ObjectId,

  event: String,
  eventStartData: Date,
  eventEndData: Date,

  header: String,
  footer: String,
  comments: String,

  vat: Number,   // must divide by 100
  productionCosts: Number,
  shippingCosts: Number, // in cents
  otherCosts: Number,
};


let DistributionModel = new Schema(DistributionSchema);


module.exports = Mongoose.Model('Distribution', DistributionModel);
