<template>
  <div class="drp-subscribe">
    <div v-if="status===0">
      <form id="newsletter"
            v-on:submit.prevent="doSubscribe"
      >
        <div class="row ">
          <div class="col-xs-0 col-sm-2 "></div>
          <div class="col-xs-12 col-sm-8 drp-col-left drp-info">
            <b>Meer weten over creatieve procesdocumentatie?</b> Blijf op de hoogte van de laatste ontwikkelingen bij Dropper via onze nieuwsbrief:
          </div>
        </div>
        <div class="row">
          <div class="col-xs-0 col-sm-2 "></div>
          <div class="col-xs-12 col-sm-4 drp-col-left">
            <div class="drp-input">
              <q-input label="Voornaam" dense class="full"  type="text" v-model="firstName" data-firstname/>
            </div>
          </div>
          <div class="col-xs-0 col-sm-0 "></div>
          <div class="col-xs-12 col-sm-4 drp-col-right">
            <div class="drp-input">
              <q-input label="Achternaam" dense class="full"  type="text" v-model="lastName" data-lastname/>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-xs-0 col-sm-2 "></div>
          <div class="col-xs-12 col-sm-8 drp-col-left">
            <div class="drp-input">
              <q-input
                label="Email"
                data-email
                class="full"
                dense
                type="text"
                :error="showError && hasError"
                @focus="showError=false"
                v-model="email">
                  <template v-slot:error class=".error-msg">
                    Dit is geen geldig email adres
                  </template>
              </q-input>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-xs-0 col-sm-2 "></div>
          <div class="col-xs-12 col-sm-8 drp-col-left text-center drp-action">
            <q-btn type="submit" unelevated rounded color="primary" label="Ja hou mij op de hoogte"/>
          </div>
        </div>
      </form>
    </div>
    `
    <div v-if="status === 1">
      <div class="row">
        <div class="col-xs-0 col-sm-2 "></div>
        <div class="col-xs-12 col-sm-8 drp-col-left text-center drp-action" data-send>
          Er is een mail gestuurd naar <b>{{email}}</b>. In deze mail zit een link waarmee bevestigd wordt
          dat je onze nieuwsbrief wil ontvangen.
        </div>
      </div>
    </div>
    <div v-if="status === 2">
      <div class="row">
        <div class="col-xs-0 col-sm-2 "></div>
        <div class="col-xs-12 col-sm-8 drp-col-left text-center drp-action" data-resend>
          We hebben opnieuwe een email naar <b>{{email}}</b> gestuurd. In deze mail zit een link waarmee bevestigd wordt
          dat je onze nieuwsbrief wil ontvangen.
        </div>
      </div>
    </div>
    <div v-if="status === 3">
      <div class="row">
        <div class="col-xs-0 col-sm-2 "></div>
        <div class="col-xs-12 col-sm-8 drp-col-left text-center drp-action" data-already>
          Je bent reeds geaboneerd op onze niewsbrief
        </div>
      </div>
    </div>
    <div v-if="status === -1">
      <div class="row">
        <div class="col-xs-0 col-sm-2 "></div>
        <div class="col-xs-12 col-sm-8 drp-col-left text-center drp-action" data-error>
          Er is een fout opgetreden: {{ errorMessage }}
        </div>
      </div>
    </div>

  </div>
</template>

<script>

export default {
  name: 'SubscribeForm',
  data () {
    return {
      email: '',
      firstName:  '',
      lastName: '',
      hasError: false,
      showError: false,
      status: 0,
      errorMessage : ''
    }
  },
  methods: {
    doSubscribe: function(e) {
      this.showError = true;
      this.hasError = !this.validEmail(this.email)
      e.preventDefault();
      if (!this.hasError) {
        return this.$store.dispatch('subscribe/register', {firstName: this.firstName, lastName: this.lastName, email: this.email, list: 'newsletter'}).then(() => {
          this.status = this.$store.getters['subscribe/resultStatus'];
          switch(this.status) {
            case -1: // error
              this.errorMessage = this.store.getters['subscribe/resultMessage'];
              break;
            case 0: // unknown
              break;
            case 1: // send confirm mail
              break;
            case 2: // send again confirm mail
              break;
            case 3: // already confirmed
              break;
            default: // what did happen, did we change something?
             break;
          }
        })
      }
      return false;
    },

    validEmail: function (email) {
      var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
      return re.test(String(email).toLowerCase());
    }
  }

}
</script>

<style>
  .drp-subscribe {
    background-color: #FDF3AE;
    padding-top: 20px;
    padding-bottom: 20px;
  }
  @media only screen and (max-width: 600px) {
    .drp-spacer {
      margin-top: 18px;
      margin-bottom: 42px;
    }
    .drp-col-left, .drp-col-right {
      padding-right: 26px;
      padding-left: 26px;
    }
  }
  .drp-info {
    margin-top: 16px
  }
  .drp-input {
    width: 100%;
    margin-top: 13px;
    margin-bottom: 13px;
    background-color: white;
  }
  .drp-action {
    padding-top: 10px;
  }
  .full {
    width: 100%;
  }
</style>
