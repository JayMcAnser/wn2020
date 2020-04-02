/**
 * Setup the security system
 *
 * version 0.0.1 JvK 2020-03-17
 */
const Group = require('../model/group');
const User = require('../model/user');
const Contact = require('../model/contact');
const Carrier = require('../model/carrier');
const Config = require('config');
const Logging = require('./logging');

class Setup {

  checkConfig() {
    let err = false;
    if (!Config.has('Setup.passwordRoot')) {
      Logging.error(`missing Setup.passwordRoot`);
      err = true;
    }
    if (!Config.has('Setup.emailRoot')) {
      Logging.error(`missing Setup.emailRoot`);
      err = true;
    }

    return err;
  }

  /**
   * create the default groups for root access
   * @return {Promise<void>}
   */
  async createGroups() {
    const rootAccess = [{ part: '*', rights: 'aduv'}];
    let grp = await Group.findOne({name: 'root'});
    if (!grp) {
      grp = await Group.create({ name: 'root', rights:rootAccess, dirty: true})
    } else {
      if (grp.rights.length === 0 || grp.rights[0].part !== '*') {
        await Group.updateOne(
          { _id: grp._id},
          {
            $push: {
              rights: {
                $each: rootAccess, $position: 0}
              }
          }
        );
        grp = await Group.updateOne(
          { _id: grp._id},
          {
            $set: {
              "rights.0.dirty": true
            }
          }
        )
      }
    }
    return grp;
  }

  async createRootUsers(grp) {
    let rootUser = await User.findOne({ username: 'root'});
    if (!rootUser) {
      rootUser = await User.create({username: 'root', email: Config.get('Setup.emailRoot'), password: Config.get('Setup.passwordRoot') })
    }
    grp.userAdd(rootUser);
    await rootUser.save();
    return true;
  }

  async createContact() {
    let contact = await Contact.findOne({guid: 'DISTR_NOT_FOUND'});
    if (!contact) {
      contact = await Contact.create({addressId: -1, guid: 'DISTR_NOT_FOUND', name: 'Distribution contact not found'})
      await contact.save();
    }
    return true;
  }

  async createCarrier() {
    let carrier = await Carrier.findField({locationNumber: 'CARRIER_NOT_FOUND'});
    if (carrier.length === 0) {
      carrier = await Carrier.create({carrierId: -1, locationNumber: 'CARRIER_NOT_FOUND', comments: 'Carrier not found by importer'})
      await carrier.save()
      let c = await Carrier.findField({locationNumber: 'CARRIER_NOT_FOUND'});
      if (c.length === 0) {
        throw new ErrorNotFound('could not find CARRIER_NOT_FOUND');
      }
    }
    return true;
  }
  /**
   * check the system for errors
   * @return {Promise<boolean>}
   */
  async run() {
    if (this.checkConfig()) {
      return false;
    }
    let grp = await this.createGroups();
    let usr = await this.createRootUsers(grp);
    let addr = await this.createContact();
    let carr = await this.createCarrier();
    return Promise.resolve(!!usr)
  }
}
module.exports = Setup;
