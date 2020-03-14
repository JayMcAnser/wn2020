<template>
  <div :class="hasHeader">
    <slot />
    <banner-copyright >
      <template slot="date"><slot name="date"></slot></template>
      <template slot="copyright"><slot name="copyright"></slot></template>
    </banner-copyright>
  </div>
</template>

<script>
  import BannerCopyright from './BannerCopyright';
export default {
  // name: 'ComponentName',
  data () {
    return {}
  },
  props: {
    noHeader: Boolean
  },
  computed: {
    hasHeader: function() {
      return this.noHeader ? 'drp-image-no-header' : 'drp-image'
    }

  },
  components: {
    BannerCopyright
  }
}
</script>

<style>
  .drp-image img, .drp-image-no-header img {
    width: 100%
  }
  .drp-image {
    padding-bottom: 46px;
    padding-top: 42px;
  }
  .drp-image-no-header {
    padding-bottom: 46px;
  }
</style>
