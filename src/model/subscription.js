/**
 * Handling the subscription definition
 *
 * version 0.0.1 JvK 2020-01-20
 */
import Vue from 'vue';
const ENDPOINT_SUBSCRIBE = 'newsletter';

export class ErrorNotImplemented extends Error {

}
  /**
   * subscribe to list, requesting confirmation
   * @param user
   * @return Promise
   */
export function subscribeToList(user) {
    return Vue.prototype.$api.post(ENDPOINT_SUBSCRIBE, user).then((result) => {
      return result;
    }).catch( (err) => {
      Vue.prototype.$logger.error(err.message, user, 'services.subscription');
      return {
        status: -1,
        message: err.message
      }
    })
}

export function confirmEmail(key) {
  return Vue.prototype.$api.patch(`${ENDPOINT_SUBSCRIBE}/${key}`).then((result) => {
    return result;
  }).catch( (err) => {
    Vue.prototype.$logger.error(err.message, user, 'services.confirmMail');
    throw err;
  })
}
