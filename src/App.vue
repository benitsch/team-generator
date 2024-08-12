<script setup lang="ts">
  import TheHeader from './components/TheHeader.vue';
  import TheFooter from './components/TheFooter.vue';
</script>

<template>
  <v-app>
    <TheHeader></TheHeader>
    <v-main class="mb-12">
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
    <TheFooter></TheFooter>
  </v-app>
</template>

<style>
  @font-face {
    font-family: 'LifeCraft';
    src:
      local('LifeCraft'),
      url(/fonts/LifeCraft_Font.ttf) format('truetype');
  }
</style>
