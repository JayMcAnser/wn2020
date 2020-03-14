/*
export function someMutation (state) {
}
*/

export function SET_USER(state, userObj) {
  state.email = userObj.email;
  state.firstname = userObj.firstname;
  state.lastname = userObj.lastname;
  state.list = userObj.list;
}
export function EMAIL(state, value) {
  state.email = value;
}
export function NAME(state, value) {
  state.name = value
}
export function LIST_ID(state, value) {
  state.listId = value;
}

/**
 * store the result of the api call
 *
 * @param state
 * @param value Object { status, message}
 * @constructor
 */
export function RESULT_STATUS(state, value) {
  state.resultStatus = value.status;
  state.resultMessage = value.message;
}

/**
 * clear the status of the api call
 * @param state
 * @constructor
 */
export function RESULT_CLEAR(state) {
  state.resultStatus = 0;
  state.resultMessage = '';
}
