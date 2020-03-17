/**
 * Setup the security system
 *
 * version 0.0.1 JvK 2020-03-17
 */
const Group = require('../model/group');
const User = require('../model/user');
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

  /**
   * check the system for errors
   * @return {Promise<boolean>}
   */
  async run() {
    if (this.checkConfig()) {
      return false;
    };
    let grp = await this.createGroups();
    let usr = await this.createRootUsers(grp);
    return !!usr
  }
}
module.exports = Setup;
