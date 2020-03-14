<template>
  <div>
    <div class="row page-banner">
      <div class="col-12">
        <slot />
      </div>
    </div>
    <banner-copyright show-arrow>
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

  components: {
    BannerCopyright
  }

}
</script>

<style>
  .page-banner img {
    width: 100%;
    margin-bottom: -4px; /* somehow we loose 4 px without reason */
  }

</style>
