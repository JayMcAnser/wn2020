/**
 * global api call
 * version 0.2
 */

import ApiCall from '../services/api-call.axios';

export default async ({ Vue }) => {
  if (process.env.ENV === 'dev') {
    console.log('plugin: api');
  }
  Vue.prototype.$api = new ApiCall();
}
