/**
 * global logger call
 * version 0.2
 */

import Logger from '../services/logging';

export default async ({ Vue }) => {
  if (process.env.ENV === 'dev') {
    console.log('plugin: logger');
  }
  Vue.prototype.$logger = new Logger();
}
