/* eslint-disable */
/**
 * @jest-environment jsdom
 * Testing the Subscription form
 * version 0.1 Jay
 */

import { mount, createLocalVue, shallowMount } from '@vue/test-utils'
import SubscribeForm from '../../../../src/components/SubscribeForm';
import * as All from 'quasar'
const { Quasar, date } = All

const components = Object.keys(All).reduce((object, key) => {
  const val = All[key]
  if (val && val.component && val.component.name != null) {
    object[key] = val
  }
  return object
}, {})

describe('SubcribeForm', () => {
  const localVue = createLocalVue()

  // set this to set the getter result
  let result = {};

  /**
   * fake dispatch store that handles the return
   *
   * @type {{dispatch: dispatch, readonly getters: {}}}
   */
  let $store = {
      dispatch :(key, value) =>  {
        switch (key) {
          case 'subscribe/register':
            result.called = 'subscribe/register';
            result.value = value;
            break;
          default:
            return Promise.reject()
        }
        return Promise.resolve()
      },
      get getters() {
        return result;
      }
    }
  localVue.use(Quasar, { components }) // , lang: langEn

  let wrapper;
  let vm;

  beforeEach( () => {
    wrapper = mount(SubscribeForm, {
      localVue
    })
    vm = wrapper.vm
    vm.$store = $store;
  })

  //expect(wrapper.vm.$store.test).toBeEqual('xx')
  // it('passes the sanity check and creates a wrapper', () => {
  //   expect(wrapper.isVueInstance()).toBe(true)
  // })

  it('subscribe if valid email', async () => {
    result = {
      'subscribe/resultStatus' : 1//result.status
    };
    const EMAIL = 'info@test.com';
    let edit = wrapper.find('[data-email]')
    edit.setValue(EMAIL)
    const FIRST_NAME = 'John';
    edit = wrapper.find('[data-firstname]');
    edit.setValue(FIRST_NAME);
    const LAST_NAME = 'Doe';
    edit = wrapper.find('[data-lastname]');
    edit.setValue(LAST_NAME);

    expect(vm.email).toBe(EMAIL);
    wrapper.find("form").trigger("submit.prevent")
    await wrapper.vm.$nextTick();

    expect(result.called).toBe('subscribe/register');
    const msg = wrapper.find('[data-send]');
    expect(msg.text()).toContain(EMAIL)
    expect(result.called).toBe('subscribe/register')
    expect(result.value.email).toBe(EMAIL, 'have the email')
    expect(result.value.firstName).toBe(FIRST_NAME, 'have the first')
    expect(result.value.lastName).toBe(LAST_NAME, 'have the last')
  });

  it('invalid email', async () => {
    result = {
      called: false,
      'subscribe/resultStatus' : 1//result.status
    };
    const EMAIL = 'info@test';
    let edit = wrapper.find('[data-email]')
    expect(edit).toBeDefined();
    edit.setValue(EMAIL);
    expect(vm.email).toBe(EMAIL);

    wrapper.find("form").trigger("submit.prevent")
    await wrapper.vm.$nextTick();
    // no call because email isn't valid
    expect(result.called).toBe(false);
  })
});

