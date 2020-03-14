<template>
  <q-page padding>
    <banner-full>
      <img src="~assets/design/rietveld.1.svg" />
      <template slot="copyright">Centraal museum Utrecht</template>
    </banner-full>

    <row-two>
      <template slot="title">Rietveld <br class="gt-sm"/>meets AI</template>
      <template slot="col1">
        <b>Story of the Pressroom</b><br/>
        How can we benefit from archives? What drives collecting, how are items related to each other and to us? Sharing such stories is what drives cultural heritage preservation. Archiving in itself, is not aimed at telling stories. But it could be, and we think it should be. We collect and select, we preserve, and we document, we do it to connect, so we can share what is of value to each other. A legacy is best preserved when it has currency as part of a rich exchange. At Dropper we focus on both archive utility and process documention. We design information systems for culture and heritage organisations.</div>
      </template>
      <template slot="col2">
        We are are building a smart digital storytelling app for museums, archives and creative professionals. On these pages you can follow our progress. How can we benefit from archives? What drives collecting, how are items related to each other and to us? Sharing such stories is what drives cultural heritage preservation. Archiving in itself, is not aimed at telling stories. But it could be, and we think it should be. We collect and select, we preserve, and we document, we do it to connect, so we can share what is of value to each other. A legacy is best preserved when it has currency as part of a rich exchange. At Dropper we focus on both archive utility and process documention. We design information systems for culture and heritage organisations. We are are building a smart digital storytelling app for museums, archives and creative professionals. On these pages you can follow our progress.
      </template>
    </row-two>

    <banner-width>
      <img src="~assets/design/rietveld.2.svg" />
    </banner-width>
  </q-page>

</template>

<script>
  import BannerFull from '../components/BannerFull';
  import RowTwo from '../components/RowTwo';
  import BannerWidth from '../components/BannerWidth';

  export default {
    // name: 'PageName',
    components: {
      BannerFull,
      BannerWidth,
      RowTwo
    }
  }
</script>

<style>
  .text-block {
    padding: 43px;
  }
</style>
