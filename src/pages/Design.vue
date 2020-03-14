<template>
  <q-page padding>
    <div class="row">
      <div class="col-1 gt-xs"></div>
      <div class="col-sm-10 col-xs-12">
        <h1>Design</h1>
      </div>
    </div>
    <link-info to="design/rietveld" >
      <template v-slot:title>Case – Rietveld meets AI</template>
      <template v-slot:date>12/09/2019</template>
      <template v-slot:content>
          How can we benefit from archives?<br/> What drives collecting, how are items related to each other and to us? Sharing these stories is what drives cultural heritage preservation. Archiving in itself, is not aimed at telling stories. But it could be, and we think it should be. We collect and select, we preserve, and we document, we do it to connect, so we can share what is of value to each other.
      </template>
    </link-info>
    <link-info to="design/font">
      <template v-slot:title>Dropper Font</template>
      <template v-slot:date>10/09/2019</template>
      <template v-slot:content>
          What about the font?<br/>
          See what this font can show yout
      </template>
    </link-info>
  </q-page>
</template>

<script>
  import LinkInfo from '../components/LinkInfo';
export default {
  name: 'Design',
  components: {
    LinkInfo,
  }
}
</script>

<style>
</style>
