
export function email(state) {
  return state.email;
}
export function name(state) {
  return state.name
}
export function list(state) {
  return state.list;
}
export function isValid(state) {
  return (state.email && state.email.length > 0) && (state.list && state.list.length > 0)
}

export function user(state) {
 return {
   firstname: state.firstname,
   lastname: state.lastname,
   email: state.email,
   list: state.list
 }
}
/**
 * returns a list of field needed to register an user
 * @param state
 * @return Boolean | String
 */
export function validErrors(state) {
  let result = false;
  if (!!state.email) {
    result = 'email'
  }
  if (!!state.listId) {
    if (result) {
      result +=  `, listId`
    } else {
      result = 'listId'
    }
  }
  return result;
}

export function resultStatus(state) {
  return state.resultStatus;
}
export function resultMessage(state) {
  return state.resultMessage;
}
