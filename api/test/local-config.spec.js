/**
 * Test the local write to configl
 */

const init = require('./init');
const chai = require('chai');
const assert = chai.assert;
const LocalConfig = require('../lib/local-config');

describe('local-config', () => {

  // it('filenane', () => {
  //   let name = LocalConfig.configName();
  //   assert.include(name,'local.json');
  // });
  //
  // it ('set value', () => {
  //   assert.isTrue(LocalConfig.writeValue('Test.value1', 'testing'));
  //   const Config = require('config');
  //   assert.equal(Config.get('Test.value1'), 'testing');
  //   assert.isTrue(LocalConfig.writeValue('Test.value1', 'change'));
  //   // This does NOT work. The config is cached so it does not see the changes.
  //   // We must restart the server if this is used
  //   // --- assert.equal(Config.get('Test.value1'), 'change');
  // });
  //
  // it('value not found', () => {
  //   assert.isFalse(LocalConfig.writeValue('TestXX.value1', 'testing'));
  // })
});
