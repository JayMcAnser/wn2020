<template>
  <q-page padding>
    <row-one>
      <template v-slot:col1>
        <p><b>Dropper Stichting</b> KvK-nummer 76937461</p>
        <p>
          Dropper Stichting ontwikkelt en beheert data distributie systemen; software voor het (her)gebruik van contextuele collectiedata en maakt interactieve presentaties met dynamische data. Designlab onderzoek richt zich op creatieve procesdocumentatie en de ontwikkeling van de Dropper Curator webapplicatie.
        </p>
        <p>
          Email: office@dropper.info | Telefoon: +31(0)641120890<br />
          Adres: Lange Herenvest 20, 2011BS Haarlem, NL, www.dropper.info
        </p>
      </template>
    </row-one>
    <row-two>
      <template v-slot:col1>
        <p><b>Pier Taylor</b> is creatief directeur bij Dropper in Haarlem. Hij studeerde Design Culture Studies aan de ZHdK in Zwitserland en heeft een BA Grafisch Ontwerpen van de HKA-ArtEZ, Arnhem. Hij werkte voor Mint, Koeweiden Postma en sinds 2009 zelfstandig. Als grafisch en interactie ontwerper voor cultuur en overheid organisaties heeft Taylor ervaring met digitaal erfgoed, publishing, user experience & digitale toegankelijkheid onderzoek. Pier werkt ondermeer voor LIMA, Waag Society en Mediakunst.net.</p>
      </template>
      <template v-slot:col2>
        <p><b>Jaap van der Kreeft</b> is technisch directeur bij Dropper in Haarlem. Hij studeeerde aan de UvA wiskunde en is bouwkundig- en bedrijfskundig ingenieur. Vanaf 1985 werkt hij in de automatisering specifiek voor de culturele- en erfgoed sector. Eerst bij I&O, dan bij Adlib. Sinds 1992 werkt hij als lead developer bij zijn eigen bedrijf Toxus, doet hij projectleiding en advies. Hij is ondermeer de ontwikkelaar van collectie-informatiesysteem WatsNext, de EM-Cultuur contacten database en online collectiecatalogus Mediakunst.net.</p>
      </template>
    </row-two>
    <row-two>
      <template v-slot:col1>
        <p>Het Dropper Curator team betaat uit Pier, Jaap en Sanneke Huisman. Dropper werkt met de <b>Rijksdienst voor het Cultureel Erfgoed als kennispartner</b>.</p>

        <p><b>Sanneke Huisman</b> is curator, schrijver en kunstcriticus. Zij ontwikkelde het canon van de Nederlandse mediakunst en recent is het boek <i>A Critical History of Media Art in the Netherlands</i> van haar verschenen.</p>
      </template>
      <template v-slot:col2>
        <p>Dropper stichting bestuursleden zijn Nirav Christophe van de Loo, Gaby Wijers en Pieter Jongelie.</p>

        <p><b>Nirav Christophe</b> (voorzitter) is lector performatieve maakprocessen aan de Hogeschool voor de Kunsten Utrecht.</p>

        <p><b>Gaby Wijers</b> (secretaris) is oprichter en directeur van LIMA, platform voor mediakunst, nieuwe technologie en digitale cultuur in Amsterdam.</p>

        <p><b>Pieter Jongelie</b> (penningmeester) is zakelijk directeur van Orkest de Ereprijs, <i>living lab</i> voor talent-ontwikkeling en muziekeducatie.</p>
      </template>
    </row-two>
  </q-page>
</template>

<script>
  import RowOne from '../components/RowOne';
  import RowTwo from '../components/RowTwo';
  export default {
    name: 'Stichting',
    components: {
      RowOne,
      RowTwo
    }
  }

</script>

<style scoped>

</style>
