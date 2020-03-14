/**
 * Working version to test an component.
 */
import { mount, shallowMount, createLocalVue } from '@vue/test-utils';
import { Quasar, QBtn, QInput } from 'quasar';
import SubscribeForm from '../../../../src/components/SubscribeForm';


describe('SubscribeForm.vue', () => {

  let wrapper;
  beforeEach(() => {
    const localVue = createLocalVue();
    localVue.use(Quasar, { components: { QBtn, QInput } });
    wrapper = shallowMount(SubscribeForm, { localVue });
  });

  it ('renders form', () => {
    //const wrapper = mount(SubscribeForm);
    expect(wrapper.html().includes("procesdocumentatie")).toBe(true)
  });

  // it('no email address', async () =>{
  // //   console.log('XXXX', JSON.stringify(wrapper));
  // //   wrapper.find('input[type=text]').setValue('info@test');
  // //   wrapper.find("form").trigger("submit.prevent")
  //    await wrapper.vm.$nextTick();
  // //
  //    expect(wrapper.find('.error-msg').text()).toBe('Dit is geen geldig email adres')
  // });
})
