<template>
  <div>
    <div class="row page-banner"  v-if="hasCopyright">
      <div class="col-sm-1 col-xs-0"></div>
      <div class="col-sm-4 col-xs-4 float-left drp-valign drp-date"><slot name="date"></slot></div>
      <div class="col-sm-2 col-xs-0"><img v-if="showArrow" class="drp-icon gt-xs" src="~assets/icon/arrow-down.svg" /></div>
      <div class="col-sm-4 col-xs-8"><div class="text-right drp-valign drp-copyright"><slot name="copyright"></slot></div></div>
    </div>
  </div>
</template>

<script>
export default {
  // name: 'ComponentName',
  data () {
    return {}
  },
  props: {
    showArrow: Boolean
  },
  computed: {
    hasCopyright: function() {
      return this.$slots.copyright && this.$slots.copyright.length > 0;
    }
  }
}
</script>

<style>
  .page-banner {
    position: relative;
    margin: 0;
  }
  .drp-valign {
    margin-top: 12px;
  }

  .drp-icon {
    height: 46px;
    width: 46px;
    display: inline-block;
  }


  .drp-copyright {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: right;
  }
  @media only screen and (max-width: 600px) {
    .drp-copyright {
      padding-right: 26px;
    }
    .drp-date {
      padding-left: 26px;
    }
  }
</style>
