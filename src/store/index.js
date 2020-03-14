import Vue from 'vue'
import Vuex from 'vuex'

// import example from './module-example'
import layout from './layout';
import subscribe from './subscribe';

Vue.use(Vuex)
Vue.config.devtools = true;
/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      layout,
      subscribe
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEV
  })

  return Store
}
