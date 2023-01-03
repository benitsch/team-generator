<template>
  <v-app-bar app elevation="2">
    <v-img src="src/assets/logo.svg"></v-img>
    <!-- TODO Another Font for "LanCraft" title -->
    <v-app-bar-title>LanCraft</v-app-bar-title>
    <v-spacer></v-spacer>
    <!-- FIXME active tab is wrong when browser refresh with non-home route is done -->
    <v-tabs>
      <v-tab replace v-for="route of routes" :key="route.name" :to="route.path">
        {{ route.name }}
      </v-tab>
    </v-tabs>
  </v-app-bar>
</template>

<script lang="ts">
export default {
	name: 'TheHeader',
	data() {
		return {
			routes: this.$router.options.routes
		}
	},
}
</script>

<style scoped></style>
