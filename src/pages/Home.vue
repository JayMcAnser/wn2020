<template>
  <q-page>
    <banner-full>
      <img src="~assets/home/home.svg" />
      <template slot="date">18 jan 2020</template>
      <!-- <template slot="copyright">&copy; Yellow car productions showq in amsterdam</template> -->
    </banner-full>
    <row-two>
      <template v-slot:col1>
        <p><b>Dropper designlab</b> wordt geleid door Pier Taylor, interactie-ontwerper en Jaap van der Kreeft, software-ontwerper. Samen ontwerpen zij data distributie systemen; software voor het hergebruik van contextuele collectiedata.</p>

        <ul>
          <li>Onze core-activiteit is interactieve presentaties ontwerpen met dynamische data.</li>
          <li>Ontwerp onderzoek betreft de documentatie van creatieve processen. Wij ontwikkelen daarvoor de webapp Dropper Curator.</li>
        </ul>
        <p>
        Het designlab is in 2020 geregistreerd als Dropper Stichting te Haarlem.
        </p>
      </template>
      <template v-slot:col2>
        Dropper Curator is software voor curatoren om ‘the making of’ verhalen van cultureel erfgoed en musea online te presenteren en delen. Door de presentatie van maak- en reconstructieprocessen wordt de gezamenlijk gearchiveerde en gedigitaliseerde culturele erfenis beter zichtbaar. Curatoren kunnen in Dropper Curator zonder programmeerkennis interactieve documentaires maken. De in presentaties gebruikte elementen en objecten kunnen open worden gedeeld. Dat maakt de erfgoed objecten digitaal toegankelijk voor het bedenken, sleutelen aan en verspreiden van elkaars ideeën. De software gebruikt artificiële intelligentie om objecten vindbaar en (her)bruikbaar te maken.
      </template>
    </row-two>
    <banner-width>
      <img src="~assets/home/curator.svg" />
      <!-- <template slot="copyright">Dropper curator</template> -->
    </banner-width>
    <subscribe-form>

    </subscribe-form>
<!--
    <row-two>
      <template v-slot:col1>
        <b>Andere gedachtes</b><br/>
        Heldere omschrijving van het concept; benoem op welke opgave het project zich richt. Sharing such stories is what drives cultural heritage preservation. Archiving in itself, is not aimed at telling stories. But it could be, and we think it should be. We collect and select, we preserve, and we document, we do it to connect, so we can share what is of value to each other. A legacy is best preserved when it has currency as part of a rich exchange. At Dropper we focus on both archive utility and process documention.
      </template>
      <template v-slot:col2>
        We design information systems for culture and heritage organisations. We are are building a smart digital storytelling app for museums, archives and creative professionals. On these pages you can follow our progress.<br/>
        How can we benefit from archives? What drives collecting, how are items related to each other and to us? Sharing such stories is what drives cultural heritage preservation. Archiving in itself, is not aimed at telling stories. But it could be, and we think it should be. We collect and select, we preserve, and we document, we do it to connect, so we can share what is of value to each other. A legacy is best preserved when it has currency as part of a rich exchange. At Dropper we focus on both archive utility and process documention. We design information systems for culture and heritage organisations. We are are building a smart digital storytelling app for museums, archives and creative professionals. On these pages you can follow our progress.
      </template>
    </row-two>

    <row-two>
      <template v-slot:col1>
        <b>Andere gedachtes</b><br/>
        Heldere omschrijving van het concept; benoem op welke opgave het project zich richt. Sharing such stories is what drives cultural heritage preservation. Archiving in itself, is not aimed at telling stories. But it could be, and we think it should be. We collect and select, we preserve, and we document, we do it to connect, so we can share what is of value to each other. A legacy is best preserved when it has currency as part of a rich exchange. At Dropper we focus on both archive utility and process documention.
      </template>
      <template v-slot:col2>
        <column-image no-header>
          <img src="~assets/home/image.3.jpg" />
          <template slot="copyright">World Towers</template>
        </column-image>
        We design information systems for culture and heritage organisations. We are are building a smart digital storytelling app for museums, archives and creative professionals. On these pages you can follow our progress.<br/>
        How can we benefit from archives? What drives collecting, how are items related to each other and to us? Sharing such stories is what drives cultural heritage preservation. Archiving in itself, is not aimed at telling stories. But it could be, and we think it should be. We collect and select, we preserve, and we document, we do it to connect, so we can share what is of value to each other. A legacy is best preserved when it has currency as part of a rich exchange. At Dropper we focus on both archive utility and process documention. We design information systems for culture and heritage organisations. We are are building a smart digital storytelling app for museums, archives and creative professionals. On these pages you can follow our progress.
      </template>
    </row-two>
-->
  </q-page>
</template>

<script>
  import BannerFull from '../components/BannerFull';
  import BannerWidth from '../components/BannerWidth';
  import RowTwo from '../components/RowTwo';
  import ColumnImage from '../components/ColumnImage';
  import SubscribeForm from '../components/SubscribeForm'
export default {
  name: 'Home',
  components: {
    BannerFull,
    BannerWidth,
    RowTwo,
    ColumnImage,
    SubscribeForm
  }
}
</script>

<style>
  .info {
    position: absolute;
    color: white;
    top: 57px;
    left:71px;
    font-size: 16px;
    width: 249px;
  }
  .link {
    font-size: 12px;
  }
</style>
