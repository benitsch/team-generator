<template>
  <div class="team-match__container d-flex align-center mr-8 mt-5">
    <TeamTile :team="match.team" :opposite-team="match.oppositeTeam" :game="game"></TeamTile>
    <template v-if="match.oppositeTeam != null">
      <hr>
      <TeamTile :team="match.oppositeTeam" :opposite-team="match.team" :game="game"></TeamTile>
    </template>
  </div>
</template>

<script setup lang="ts">
// A Match component contains two TeamTile components. The Match component knows which team is playing against each other.

import TeamTile from "@/components/TeamTile.vue";
import Match from "@/models/Match";
import Game from "@/models/Game";

const props = defineProps({
  match: {
    type: Match,
    required: true
  },
  game: {
    type: Game,
    required: true
  }
});

const match = props.match;
const game = props.game;

</script>

<style scoped>
  hr {
    border-top: 1px solid black;
    width: 20px;
  }
</style>