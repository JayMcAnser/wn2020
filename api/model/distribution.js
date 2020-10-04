/**
 * A flex distribution model where the field can be define on-the-fly
 *
 */
const Mongoose = require('../lib/db-mongo');
const Schema = Mongoose.Schema;
const ErrorTypes = require('error-types');
const Logging = require('../lib/logging');
const UndoHelper = require('mongoose-undo');
const ModelHelper = require('./model-helper');
const Art = require('./art');
const _ = require('lodash');
const Util = require('../lib/util');
const Config = require('../lib/default-values');


const RoyaltieSchema  = Mongoose.Schema( {
  contactPercentage: Number,
  agentPercentage: Number,
  artPercentage: Number,
  contact:  {
    type: Schema.Types.ObjectId,
    ref: 'Contact'
  },
  agent:  {
    type: Schema.Types.ObjectId,
    ref: 'Agent'
  },
  art:  {
    type: Schema.Types.ObjectId,
    ref: 'Art'
  },

})

RoyaltieSchema.virtual('amount').get(function() {
  const price = this.parent().price;
  return price * (this.contactPercentage / 100) * (this.agentPercentage / 100) * (this.artPercentage / 100)
})

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
  },
  // royalties can be to multiple person.
  royalties: [RoyaltieSchema]
};

const DistributionExtendLayout = {
  locationId: { type: String}, // the locationId of the DistributionLayout
  exactInvoice: {type: String}
}
const DistributionLayout = Object.assign({
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
  royaltiesErrors: {type: String},

  // for the undo definition
  created: UndoHelper.createSchema,
  line: [LineSchema],
}, DistributionExtendLayout);

let DistributionSchema = new Schema(DistributionLayout);
ModelHelper.upgradeBuilder('DistributionExtra', DistributionSchema, DistributionExtendLayout)

DistributionSchema.plugin(UndoHelper.plugin);

DistributionSchema.virtual('subTotalCosts')
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
DistributionSchema.virtual('totalCosts')
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
DistributionSchema.pre('save', function(next) {
  if (this.contact && ! this.invoice) {
    this.invoice = this.contact;
  }
  if (this.contact && ! this.mail) {
    this.mail = this.contact;
  }
  next();
})



DistributionSchema.methods.session = function(session) {
  this.__user = session.name;
  this.__reason = session.reason;
}

/**
 *
 * @param itemData Art or Carrier or {art:, [field]: ...} or { carrier: , [fields]}
 */
DistributionSchema.methods.lineAdd = function(itemData) {
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

DistributionSchema.methods.lineUpdate = function(index, itemData) {
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

DistributionSchema.methods.lineRemove = function(index) {
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

DistributionSchema.methods.lineCount = function() {
  return this.line.length;
};

/**
 * retrieve all information for the royalties calculation
 */
DistributionSchema.methods.royaltiesCalc = async function() {
  let error = [];
  for (let indexLine = 0; indexLine < this.line.length; indexLine++) {
    let line = this.line[indexLine];
    line.royalties = [];
    let artPercentage = 0;
    let agentPercentage = 0;
    let contactPercentage = 0;

    if (line.price > 0) {
      let royalty = {}
      let art = await Art.findById(line.art).populate({
        path: 'agents.agent',
        populate: {
           path: 'contacts.contact'
        }
      });
      if (art ) {
        // the percentage is
        art.royaltiesValidate();
        if (art.royaltiesError !== '') {
          let s = Util.replaceAll('xxx', 'x', 'y')
          error.push(`line ${indexLine}: ` + Util.replaceAll(art.royaltiesError, '\n', `\nline ${indexLine}: `))
        }
        artPercentage = Art.royaltiesPercentage === undefined ? Config.value(Config.royaltiesArtPercentage, 100) : Art.royaltiesPercentage;
        royalty.artPercentage = artPercentage
        royalty.price = line.price;
        royalty.art = art._id;
        for (let indexAgent = 0; indexAgent < art.agents.length; indexAgent++) {
          let agent = art.agents[indexAgent].agent;
          if (agent) {
            // the percentage is defined in the relation between the art and the agent
            let percAgent = art.agents[indexAgent].percentage === undefined ? 100 : art.agents[indexAgent].percentage;
            if (percAgent > 0) {
              royalty.agentPercentage = percAgent;
              agentPercentage += percAgent;

              if (agent.contacts.length === 0) {
                error.push(`line ${indexLine}: no contact found for agent "${agent.name}"`)
              } else {
                royalty.agent = agent._id;
                for (let indexContact = 0; indexContact < agent.contacts.length; indexContact++) {
                  let contact = agent.contacts[indexContact].contact;
                  let percContact = agent.contacts[indexContact].percentage === undefined ? 100 : agent.contacts[indexContact].percentage;

                  if (contact) {
                    royalty.contactPercentage = percContact
                    contactPercentage += percContact
                    royalty.contact = contact._id;
                    line.royalties.push(royalty);
                  } else {
                    Logging.error(`[royaltiesCalc.${this._id}] contact (${agent.contacts[indexContact].contact}) use in art: (${art.agents[indexAgent]}) used by art ${line.art} does not exist`)
                  }
                }
              }
            }
          } else {
            Logging.error(`[royaltiesCalc.${this._id}] agent (${art.agents[indexAgent]}) used by art ${line.art} does not exist`)
          }
        }
      } else {
        error.push(`line ${indexLine}: no art found`)
      }
      // validate the royalties
      if (royalty.artPercentage > 100) {
        error.push(`line ${indexLine}: art percentage is large then 100`)
      }
      if (agentPercentage > 100) {
        error.push(`line ${indexLine}: agent percentage is large then 100`)
      }
      if (contactPercentage > 100) {
        error.push(`line ${indexLine}: contact percentage is large then 100`)
      }
    }
  }
  this.royaltiesError = error.length ? error.join('\n') : '';
}

module.exports = Mongoose.Model('Distribution', DistributionSchema);
