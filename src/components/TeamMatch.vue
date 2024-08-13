<template>
  <div class="team-match__container d-flex align-center mr-8 mt-5">
    <TeamTile
      :team="props.match.team"
      :opposite-team="props.match.oppositeTeam"
      :game="props.game"
    ></TeamTile>
    <template v-if="props.match.oppositeTeam != null">
      <hr />
      <TeamTile
        :team="props.match.oppositeTeam"
        :opposite-team="props.match.team"
        :game="props.game"
      ></TeamTile>
    </template>
  </div>
</template>

<script setup lang="ts">
  // A Match component contains two TeamTile components. The Match component knows which team is playing against each other.

  import TeamTile from '@/components/TeamTile.vue';
  import Match from '@/models/Match';
  import Game from '@/models/Game';

  const props = defineProps({
    match: {
      type: Match,
      required: true,
    },
    game: {
      type: Game,
      required: true,
    },
  });
</script>

<style scoped>
  hr {
    border-top: 1px solid black;
    width: 20px;
  }
</style>
