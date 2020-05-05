/**
 * A flex distribution model where the field can be define on-the-fly
 *
 */
const Mongoose = require('../lib/db-mongo');
const Schema = Mongoose.Schema;
const ErrorTypes = require('error-types');
const Logging = require('../lib/logging');
const UndoHelper = require('mongoose-undo');
const _ = require('lodash');

const LineSchema = {
  order: {type: String},     // the order of the lines
  price: {type: Number},     // price in cents
  quality: {type: String},  // requested quality if art is given
  art: {
    type: Schema.ObjectId,
    ref: 'Art'
  },
  carrier: {
    type: Schema.ObjectId,
    ref: 'Carrier'
  }
};

const DistributionSchema = {
  locationId: String,
  code: { type: String },
  invoiceNumber: {type: String},
  contact: {
    type: Schema.Types.ObjectId,
    ref: 'Contact'
  },
  contactName: {type: String},
  invoice: {
    type: Schema.Types.ObjectId,
    ref: 'Contact'
  },
  invoiceName: {type: String},
  mail: {
    type: Schema.Types.ObjectId,
    ref: 'Contact'
  },
  insertion: {type: String},
  event: {type: String},
  header: {type: String},
  footer: {type: String},
  eventStartDate: {type: Date},
  eventEndDate: {type: Date},
  comments: {type: String},
  vat: {type: Number},
  productionCosts: {type: Number},
  shippingCosts: {type: Number},
  otherCosts: {type: Number},
  otherCostsText: {type: String},

  // for the undo definition
  created: UndoHelper.createSchema,
  line: [LineSchema],
}



let DistributionModel = new Schema(DistributionSchema);
DistributionModel.plugin(UndoHelper.plugin);

DistributionModel.virtual('subTotalCosts')
  .get( function() {
    let result = 0;
    if (this.line && this.line.length) {
      for (let l = 0; l < this.line.length; l++) {
        if (this.line[l].price) {
          result += this.line[l].price
        }
      }
    }
    return result;
});
DistributionModel.virtual('totalCosts')
  .get( function() {
    let result = this.subTotalCosts;
    if (this.productionCosts) {
      result += this.productionCosts
    }
    if (this.shippingCosts) {
      result += this.shippingCosts
    }
    if (this.otherCosts) {
      result += this.otherCosts
    }
    return result;
  });

/**
 * fill in the default contacts if none is given
 */
DistributionModel.pre('save', function(next) {
  if (this.contact && ! this.invoice) {
    this.invoice = this.contact;
  }
  if (this.contact && ! this.mail) {
    this.mail = this.contact;
  }
  next();
})



DistributionModel.methods.session = function(session) {
  this.__user = session.name;
  this.__reason = session.reason;
}

/**
 *
 * @param itemData Art or Carrier or {art:, [field]: ...} or { carrier: , [fields]}
 */
DistributionModel.methods.lineAdd = function(itemData) {
  let itm = _.cloneDeep(itemData)
  if (itemData.art || itemData.carrier) {
    // and object with art or carrier
    if (itemData.art) {
      itm.art = itemData.art._id === undefined ? itemData.art : itemData.art._id;
    } else if (itemData.carrier) {
      itm.carrier = itemData.carrier._id === undefined ? itemData.carrier : itemData.carrier._id;
    }
//    FlexModel.objectSet(itm, LineFieldMap, itemData);
  } else {
    // direct art or carrier
    let model = itemData.constructor.modelName;
    if (!model || ['Carrer', 'Art'].indexOf(model) < 0) {
      Logging.warn(`distribution: unknown line type: ${model}`);
      return;
    }
    itm = {};  // must reset because type is of the relation
    itm[model.toLowerCase()] = itemData._id;
  }
  this.line.push(itm);
};

DistributionModel.methods.lineUpdate = function(index, itemData) {
  let ind = index;
  if (typeof index !== 'number') {
    for (ind = 0; ind < this.line.length; ind++) {
      if (index.toString() === this.line[ind].toString()) {
        break;
      }
    }
  }
  if (ind < this.line.length) {
    Object.assign(this.line[ind], itemData);
    this.markModified('line');
  } else {
    throw new ErrorTypes.ErrorNotFound('line not found');
  }
};

DistributionModel.methods.lineRemove = function(index) {
  let ind = index;
  if (typeof index !== 'number') {
    for (ind = 0; ind < this.line.length; ind++) {
      if (index.toString() === this.line[ind].toString()) {
        break;
      }
    }
  }
  if (ind < this.line.length) {
    this.line.splice(ind, 1);
    this.markModified('line');
  } else {
    throw new ErrorTypes.ErrorNotFound('line not found');
  }
};

DistributionModel.methods.lineCount = function() {
  return this.line.length;
};

module.exports = Mongoose.Model('Distribution', DistributionModel);
