/**
 * the class to handle the newsletters
 * version 0.0.1
 */

const Table = require('./table');
const Record = require('./record');
const Postmark = require('postmark');
const Config = require('config');
const Logger = require('../lib/logging');
const ErrorTypes = require('error-types');
const uuid = require('uuid').v4;
const _ = require('lodash');


// class NewsletterRecord extends Record {
//
// }
class Newsletter extends Table {

  _config(key, defaultValue) {
    if (Config.has(key)) {
      return Config.get(key)
    }
    return defaultValue;
  }

  /**
   * send a message to the user to confirm their email address
   *
   * @param rec
   * @return {Promise<Rec or Error>|*}
   */

  sendRegisterMail(rec) {

    if (rec.isConfirmed) {
      throw new Error('already confirmed');
    }
    let key = Config.has("Mail") && Config.has("Mail.postmarkKey") ? Config.get("Mail.postmarkKey") : false;
    if (!key) {
      throw new Error('missing Mailing.postmarkKey')
    }
    let client = new Postmark.ServerClient(key);

    if (!Config.has('Mail.templates') || ! Config.has('Mail.templates.newsletterConfirm')) {
      Logger.error(`the newletterConfirm configuration was not found`);
      throw new ErrorTypes.ErrLayoutNotFound('newsletterConfirm');
    }
    let blockSendMail = this._config('Mail.blockSendMail', false);
    // must clone becauase the Config is readonly!
    let newsletter = _.clone(Config.get('Mail.templates.newsletterConfirm'));
    if (!newsletter) {
      Logger.error(`could not find Mail.templates.newsletterConfirm`);
      throw new Error('missing Mail.templates.newsletterConfirm')
    }
    Logger.info(`sending ${rec._id} with postmark key ${key}`);
    newsletter.name = rec.name ? rec.name : rec.email;
    rec.confirmKey = uuid();
    newsletter.key = rec.confirmKey;

    try {
      if (blockSendMail) {
        // for testing
        rec.registerMail = {
          date: Date.now(),
          messageId: uuid()
        }
        return this.update(rec);
      }
      return client.sendEmailWithTemplate({
        "From": newsletter.from,
        "To": "jaap@toxus.nl", // rec.data.email,
        "TemplateAlias": "newsletterInvite",
        //TemplateId:16253473,
        "TemplateModel": newsletter
      }).then((response) => {
        rec.registerMail = {
          date: response.SubmittedAt,
          messageId: response.MessageID
        }
        return this.update(rec);
      }).catch( (e) => {
        Logger.error(e.message, 'model.newsletter._sendRegisterMail');
        throw e;
      });
    } catch( e ) {
      Logger.error(e.message, 'model.newsletter._sendRegisterMail');
      throw e;
    }
  }

  /**
   * confirm the subscription
   * @param key String key used to subscribe
   * @return {Promise<number>}
   *    - -1: key not found
   *    -  0: error...
   *    -  1: did subscribe
   *    -  2: already subscribed
   */
  async confirmSubscription(key) {
    let rec = await this.findOne({confirmKey: key});
    if (rec) {
      let result = rec.isConfirmed ? 2 : 1;
      rec.isConfirmed = true;
      return this.update(rec).then( () => {
        return result;
      })
    } else {
      Logger.warn(`confirmKey (${key} was not found`, 'newsletter.confirmSubscription');
      return -1;
    }
  }
}
module.exports = Newsletter;
