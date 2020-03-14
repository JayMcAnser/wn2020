<template>
  <div class="page">
    <q-layout view="hHh lpR fFf" class="no-shadow">

      <q-header elevated class="bg-primary text-white page">
        <q-toolbar class="no-shadow">
          <div>
            <q-toolbar-title class="drp-toolbar">
              <q-btn class="flat drp-btn-clear" to="/" >
                <div class="drp-logo">Dropper</div>
<!--
                <img class="drp-logo gt-xs" src="~assets/dropper.full.svg" >
                <img class="drp-logo xs" src="~assets/dropper.small.svg" >
-->
              </q-btn>
            </q-toolbar-title>
          </div>
          <div class="drp-menu">
            <q-btn flat to="/" class="drp-menu-item gt-xs">Designlab</q-btn>
            <q-btn flat to="/stichting" class="drp-menu-item">Stichting</q-btn>
          </div>
<!--
          <q-btn flat class="drp-no-margin" ><img class="drp-login" src="~assets/icon/login.svg" /></q-btn>
-->
        </q-toolbar>
      </q-header>

      <q-page-container>
        <router-view />
      </q-page-container>

      <q-footer elevated class="footer">
        <div class="row">
          <div class="col-6">&copy; 2020 Dropper</div>
          <div class="col-6"><span class="float-right">0.2.0</span></div>
        </div>
      </q-footer>
    </q-layout>
  </div>
</template>

<style>
  .page {
    margin-right: auto;
    margin-left: auto;
    max-width: 1024px;
  }
  .drp-toolbar {
    height: 37px;
  }
  .drp-menu-item {
    display: inline-block;
    color: black;
    font-size: 1em;  /* 14px; */
    top: 0px;
  }
  .drp-btn-clear {
    padding: 0;
    margin: 0;
  }
  .drp-menu {
    margin-left: auto;
    margin-right: auto;
  }
  .drp-login {
    height: 37px;
  }
  .drp-no-margin {
    margin: 0;
    padding: 0;
  }
  .drp-logo {
    height: 37px;
    color: black;
    font-weight: bold;
    font-size: 23px;
  }
  .q-header {
    background-color: white !important;
  }
  .q-toolbar {
    padding: 15px 16px 16px;
  }
  .footer {
    background-color: white;
  }
</style>
<script>
export default {
  name: 'PublicLayout',

  data () {
    return {
      leftDrawer: true,
      tab: ''
    }
  }
}
</script>
