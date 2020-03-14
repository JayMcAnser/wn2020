<template>
  <div>
    <div class="row banner">
      <div class="col-sm-1 gt-xs"></div>
      <div class="col-xs-12 col-sm-10 drp-content">
        <slot />
      </div>
    </div>
    <banner-copyright>
      <template slot="date"><slot name="date"></slot></template>
      <template slot="copyright"><slot name="copyright"></slot></template>
    </banner-copyright>
  </div>
</template>

<script>
  import BannerCopyright from './BannerCopyright'
  export default {
    // name: 'ComponentName',
    data () {
      return {}
    },
    components: {
      BannerCopyright
    }
  }
</script>

<style>
  .banner img {
    width: 100%;
  }
  @media only screen and (max-width: 600px) {
    .drp-content {
      padding-left: 26px;
      padding-right: 26px;
    }
  }

</style>
