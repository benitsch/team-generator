<template>
  <v-app-bar app elevation="2">
    <v-img src="logo.jpg" alt="LanCraft Logo"></v-img>
    <v-app-bar-title class="lancraft-title">LanCraft</v-app-bar-title>
    <v-spacer></v-spacer>
    <v-tabs>
      <v-tab replace v-for="route of routes" :key="route.name" :to="route.path">
        {{ route.name }}
      </v-tab>
    </v-tabs>
  </v-app-bar>
</template>

<script setup lang="ts">
  import router from '@/router';

  const routes = router.options.routes;
</script>

<style scoped>
  .lancraft-title {
    font-family: 'LifeCraft', sans-serif;
    font-size: 2rem;
  }
</style>
