<template>
  <div class="row drp-spacer">
    <div class="col-sm-1 col-xs-0"></div>
    <div class="col-xs-12 col-sm-11 drp-col-left">
      <h1 v-if="hasHeader"><slot name="title"/></h1>
      <slot name="col1"/>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {}
  },
  computed: {
    hasHeader: function() {
      //console.log('now:',this.$slots, this.$slots.title && this.$slots.title.length > 0)
      return !! (this.$slots.title && this.$slots.title.length > 0);
    }
  }

}
</script>

<style>
  .drp-spacer {
    margin-bottom: 75px ;
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

  @media only screen and (min-width: 600px) {
    .drp-spacer {
      margin-top: 68px;
    }
    .drp-col-left {
      padding-right: 32px;
    }
    .drp-col-right {
      padding-left: 32px;
    }
  }
  @media only screen and (min-width: 1023px) {
    .drp-spacer {
      margin-top: 68px;
    }
    .drp-col-left {
      padding-right: 43px;
    }
    .drp-col-right {
      padding-left: 43px;
    }
  }

</style>
