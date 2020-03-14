/*
export function someAction (context) {
}
*/

export function leftDrawerState({commit}, open) {
  commit('LEFT_DRAWER', !!open)
}
