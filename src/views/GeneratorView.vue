<template>
  <h1>This is the Generator view</h1>
  <p>You can generate new team line-ups for tournaments.</p>
  <TournamentGenerator></TournamentGenerator>
</template>

<script>
import {defineComponent} from "vue";
import TournamentGenerator from "@/components/TournamentGenerator.vue";

export default defineComponent({
  components: {TournamentGenerator}
})
</script>

<style scoped></style>
