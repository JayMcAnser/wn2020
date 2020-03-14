<template>
  <q-page padding>
    <row-one v-if="status===0">
      <template v-slot:col1>
        <h2>
          Even geduld: contact maken met de server voor de bevestiging ....
        </h2>
      </template>
    </row-one>

    <row-one v-if="status===1 || status===2">
      <template v-slot:col1>
        <h2>
          Dank voor de registeratie op onze nieuwbrief.
        </h2>
      </template>
    </row-one>
    <row-one v-if="status===-1">
      <template v-slot:col1>
        <q-banner  rounded class="bg-red">
           {{ message }}
        </q-banner>
      </template>
    </row-one>

  </q-page>
</template>

<script>
  import RowOne from '../components/RowOne';
export default {
  data () {
    return {
      status: 0,
      message: 'De registratie op de nieuwsbrief is niet gelukt. De url bevat geen sleutel.'
    }
  },
  computed: {
    key () {
      return this.$route.params.key
    }
  },
  mounted() {
    if (this.key) {
      this.$store.dispatch('subscribe/confirm', this.key).then( () => {
        this.status = this.$store.getters['subscribe/resultStatus'];
        if (this.status === -1) {
          this.message = 'De meegegevens sleutel is niet juist. Registreer je opnieuw.'
        }
      }).catch( e => {

      })
    } else {
      this.status = -1;
    }
  },
  components: {
    RowOne
  }
  // name: 'PageName',
}
</script>
<style>

</style>
