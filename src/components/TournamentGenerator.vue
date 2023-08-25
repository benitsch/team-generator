<template>
  <div class="tournament-generator__container">

    <v-card>
      <v-card-title>Create a tournament</v-card-title>
      <v-card-text>
        <!-- TODO(bn) add multi select with all players next to game and team size, to select only the players who want to participate in the tournament -->
        <!-- Add a hint/warning for players where the gameskill is 0 (default) and therefore not rated -->
        <v-select
            v-model="selectedGameId"
            :items="state.games"
            item-title="name"
            item-value="id"
            label="Game"
        ></v-select>
        <v-select
            v-model="teamSize"
            :items="possibleTeamSizes"
            label="Team size"
        ></v-select>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn elevation="2" prepend-icon="mdi-tournament" @click="generateTeams">
          Generate
        </v-btn>
      </v-card-actions>
    </v-card>

    <div class="matches-container d-flex flex-wrap">
      <template v-for="match in generatedMatches" :key="match.id">
        <TeamMatch :match="match" :game="getGameBySelectedId()"></TeamMatch>
      </template>
    </div>

    <v-snackbar v-model="snackbar" timeout="5000" min-width="0" close-on-content-click>{{errorMessage}}</v-snackbar>
  </div>
</template>

<script setup lang="ts">
// This component has multiple TeamMatch components to create a tournament tree.

import { ref } from 'vue';
import TeamMatch from "@/components/TeamMatch.vue";
import {useMainStore} from "@/stores/main";
import BalancedRandomTeamGenerator, {GeneratorErrorCode} from "@/models/TeamGenerator";
import Game from "@/models/Game";
import Team from "@/models/Team";
import Player from "@/models/Player";
import Match from "@/models/Match";

const state = useMainStore();

const teamSize = ref();
const selectedGameId = ref();
const possibleTeamSizes = [2,3,4,5,6,7,8,9,10];

const generatedTeams = ref([]);
const generatedMatches = ref([]);

const snackbar = ref(false);
const errorMessage = ref("");

function generateTeams() {
  const players: Array<Player> = state.players;
  const game: Game = getGameBySelectedId();
  const balancedRandomTeamGenerator = new BalancedRandomTeamGenerator();
  const teams: Array<Team> | GeneratorErrorCode = balancedRandomTeamGenerator.generate(players, teamSize.value, game);
  if (typeof teams != "number") {
    for(let i = 0; i < teams.length; i++) {
      generatedTeams.value.push(teams[i]);
    }
  } else {
    console.log("Error Code: " + teams);
    errorMessage.value = getErrorTextByCode(teams);
    snackbar.value = true;
  }
  generatedTeamsAsMatchPair();
}

function getErrorTextByCode(code:number) {
  switch (code) {
    case 1:
      return "Team size and player length mismatch!";
    case 2:
      return "A player has no skill for this game!";
    case 3:
      return "The player list contains duplicates!";
    default:
      return "Unknown error!"
  }
}

function getGameBySelectedId() {
  return state.games.find(game => game.id === selectedGameId.value);
}

function generatedTeamsAsMatchPair() {
  const teamsLength = generatedTeams.value.length;

  for (let i = 0; i < teamsLength; i = i+2) {
    if (i + 1 < teamsLength) {
      generatedMatches.value.push(new Match(generatedTeams.value[i], generatedTeams.value[i + 1]));
    } else {
      generatedMatches.value.push(new Match(generatedTeams.value[i], null));
    }
  }
}

</script>

<style scoped>

</style>