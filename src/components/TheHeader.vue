<template>
  <v-app-bar app elevation="2">
    <v-img src="logo.jpg" alt="LanCraft Logo"></v-img>
    <v-app-bar-title class="lancraft-title">LanCraft</v-app-bar-title>
    <v-spacer></v-spacer>
    <v-tooltip
      v-if="store.hasUnsavedChanges"
      text="Unsaved changes – please download JSON!"
      location="bottom"
    >
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          icon="mdi-information"
          class="unsaved-indicator ml-2"
          size="small"
          to="/"
        ></v-btn>
      </template>
    </v-tooltip>
    <v-tabs>
      <v-tab replace v-for="route of routes" :key="route.name" :to="route.path">
        {{ route.name }}
      </v-tab>
    </v-tabs>
  </v-app-bar>
</template>

<script setup lang="ts">
  import router from '@/router';
  import { useMainStore } from '@/stores/main';

  const routes = router.options.routes;
  const store = useMainStore();
</script>

<style scoped>
  .lancraft-title {
    font-family: 'LifeCraft', sans-serif;
    font-size: 2rem;
  }

  .unsaved-indicator {
    background-color: orange;
    color: white;
  }
</style>
