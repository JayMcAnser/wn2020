<template>
  <q-page padding>
    <banner-full>
      <img src="~assets/app/image.1.svg" />
    </banner-full>

    <row-two>
      <template v-slot:title>App</template>
      <template v-slot:col1>
        <b>Het plan kort beschreven</b><br/>
        Heldere omschrijving van het concept; benoem op welke opgave het project zich richt. Sharing such stories is what drives cultural heritage preservation. Archiving in itself, is not aimed at telling stories. But it could be, and we think it should be. We collect and select, we preserve, and we document, we do it to connect, so we can share what is of value to each other. A legacy is best preserved when it has currency as part of a rich exchange. At Dropper we focus on both archive utility and process documention.
      </template>
      <template v-slot:col2>
        We design information systems for culture and heritage organisations. We are are building a smart digital storytelling app for museums, archives and creative professionals. On these pages you can follow our progress.<br/>
        How can we benefit from archives? What drives collecting, how are items related to each other and to us? Sharing such stories is what drives cultural heritage preservation. Archiving in itself, is not aimed at telling stories. But it could be, and we think it should be. We collect and select, we preserve, and we document, we do it to connect, so we can share what is of value to each other. A legacy is best preserved when it has currency as part of a rich exchange. At Dropper we focus on both archive utility and process documention. We design information systems for culture and heritage organisations. We are are building a smart digital storytelling app for museums, archives and creative professionals. On these pages you can follow our progress.
      </template>
    </row-two>

    <banner-full>
      <img src="~assets/design/rietveld.1.svg" />
    </banner-full>

  </q-page>
</template>

<script>
  import BannerFull from '../components/BannerFull';
  import RowTwo from '../components/RowTwo';

export default {
  // name: 'PageName',
  components: {
    BannerFull,
    RowTwo
  }
}
</script>

<style>
</style>
