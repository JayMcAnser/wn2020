<template>
  <q-page padding>
    <header-full>Dropper font</header-full>
    <div>
      <img v-show="index===0"  src="~assets/design/dropper-font/ani-01.svg" />
      <img v-show="index===1"  src="~assets/design/dropper-font/ani-02.svg" />
      <img v-show="index===2"  src="~assets/design/dropper-font/ani-03.svg" />
      <img v-show="index===3"  src="~assets/design/dropper-font/ani-04.svg" />
      <img v-show="index===4"  src="~assets/design/dropper-font/ani-05.svg" />
      <img v-show="index===5"  src="~assets/design/dropper-font/ani-06.svg" />
      <img v-show="index===6"  src="~assets/design/dropper-font/ani-07.svg" />
      <img v-show="index===7"  src="~assets/design/dropper-font/ani-08.svg" />
      <img v-show="index===8"  src="~assets/design/dropper-font/ani-09.svg" />
      <img v-show="index===9"  src="~assets/design/dropper-font/ani-10.svg" />
      <img v-show="index===10"  src="~assets/design/dropper-font/ani-11.svg" />
      <img v-show="index===11"  src="~assets/design/dropper-font/ani-12.svg" />
      <img v-show="index===12"  src="~assets/design/dropper-font/ani-13.svg" />
      <img v-show="index===13"  src="~assets/design/dropper-font/ani-14.svg" />
      <img v-show="index===14"  src="~assets/design/dropper-font/ani-15.svg" />
      <img v-show="index===15"  src="~assets/design/dropper-font/ani-16.svg" />
      <img v-show="index===16"  src="~assets/design/dropper-font/ani-17.svg" />
      <img v-show="index===17"  src="~assets/design/dropper-font/ani-18.svg" />
      <img v-show="index===18"  src="~assets/design/dropper-font/ani-19.svg" />
      <img v-show="index===19"  src="~assets/design/dropper-font/ani-20.svg" />
      <img v-show="index===20"  src="~assets/design/dropper-font/ani-21.svg" />
      <img v-show="index===21"  src="~assets/design/dropper-font/ani-22.svg" />
      <img v-show="index===22"  src="~assets/design/dropper-font/ani-23.svg" />
      <img v-show="index===23"  src="~assets/design/dropper-font/ani-24.svg" />
    </div>
    <RowTwo>
      <template name="h"
    </RowTwo>
  </q-page>
</template>

<script>
  import HeaderFull from '../components/HeaderFull';
  import RowTwo from '../components/RowTwo';
export default {
  // name: 'PageName',
  components: {
    HeaderFull,
    RowTwo,
  },
  data () {
    return {
      index: 0,
      timer: null,
    }
  },
  mounted: function() {
    this.timer = setInterval( () => {
      console.log('Index', this.index)
      this.index = (this.index + 1) % 24;
    }, 500)
  },
  destroyed () {
    clearInterval(this.timer)
  }
}
</script>

<style>
  .hidden {
    display: none;
  }
</style>
