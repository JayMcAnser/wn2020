<template>
  <div class="row">
    <div class="col-2 gt-xs"></div>
    <div class="col-sm-9 col-xs-12 ">
      <h2 @click="moveTo"><slot name="title"></slot></h2>
      <p class="date"><slot name="date"></slot></p>
      <p @click="moveTo" class="synposis"><slot name="content"></slot></p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LinkInfo',
  data () {
    return {}
  },
  props: ['to'],
  methods: {
    moveTo: function() {
      this.$router.push(this.to);
      console.log('clicked')
    }
  },
}
</script>

<style>
  h2, .synposis {
    cursor: pointer;
  }

</style>
