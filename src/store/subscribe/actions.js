/*
export function someAction (context) {
}
*/

const ErrorTypes = require('../../services/err-types');
const Subscribe = require('../../model/subscription');
/**
 *
 * @param context
 * @param userObj Object:  email, name, listId
 */
export function register(context, userObj) {
  context.commit('SET_USER', userObj);
  if (!context.getters['isValid']) {
    return Promise.reject(new ErrorTypes.ErrNotAllowed(`missing ${context.getters['validErrors']}`))
  }

  context.commit('RESULT_CLEAR');
  return Subscribe.subscribeToList(context.getters['user']).then( (aws) => {
    context.commit('RESULT_STATUS', aws);
    return Promise.resolve();
  })
}

export function confirm(context, key) {
  context.commit('RESULT_CLEAR');
  return Subscribe.confirmEmail(key).then( (aws) => {
    context.commit('RESULT_STATUS', aws);
    return Promise.resolve();
  })
}
