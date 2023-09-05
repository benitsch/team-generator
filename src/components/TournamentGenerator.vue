<template>
  <div class="tournament-generator__container">

    <v-card>
      <v-card-title>Create a tournament</v-card-title>
      <v-card-text>
        <v-select
            v-model="selectedParticipants"
            :items="state.players"
            label="Player"
            multiple
            item-value="id"
            item-title="tag"
        >
<!--          <template v-slot:prepend-item>-->
<!--            <v-list-item-->
<!--                title="Select All"-->
<!--                @click="toggleSelectAll"-->
<!--            >-->
<!--              <template v-slot:prepend>-->
<!--                <v-checkbox-btn-->
<!--                    :color="someParticipantsSelected() ? 'indigo-darken-4' : undefined"-->
<!--                    :indeterminate="someParticipantsSelected() && !allParticipantsSelected()"-->
<!--                    :model-value="someParticipantsSelected()"-->
<!--                ></v-checkbox-btn>-->
<!--              </template>-->
<!--            </v-list-item>-->

<!--            <v-divider class="mt-2"></v-divider>-->
<!--          </template>-->
<!--          <template v-slot:selection="{ item }">-->
<!--            <span>{{ item.title }}</span>-->
<!--          </template>-->
        </v-select>
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
// @ts-nocheck
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

const selectedParticipants = ref([]);
const selectedGameId = ref();
const teamSize = ref();
const possibleTeamSizes = [2,3,4,5,6,7,8,9,10];

const generatedTeams = ref<Team[]>([]);
const generatedMatches = ref<Match[]>(state.matches);

const snackbar = ref(false);
const errorMessage = ref("");

function generateTeams() {
  const players: Array<Player> = getPlayerById(selectedParticipants.value);
  const game: Game = getGameBySelectedId();
  generatedTeams.value.splice(0);

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
  setMinMaxTeamSkill();
  generatedTeamsAsMatchPair();
}

// TODO implement "Select All" feature in v-select for participants (player)
// function allParticipantsSelected() {
//   return selectedParticipants.value.length === state.players.length;
// }
//
// function someParticipantsSelected() {
//   return selectedParticipants.value.length > 0;
// }
//
// function toggleSelectAll() {
//   if (allParticipantsSelected()) {
//     selectedParticipants.value.splice(0);
//   } else {
//     selectedParticipants.value.splice(0);
//     selectedParticipants.value.push(...state.players.map(player => player.tag));
//   }
// }

function getPlayerById(playerIds: string[]) {
  return state.players.filter(player => playerIds.includes(player.id));
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
  const selectedGame = state.games.find(game => game.id === selectedGameId.value);
  return selectedGame ? selectedGame : new Game();
}

function generatedTeamsAsMatchPair() {
  const teamsLength = generatedTeams.value.length;
  generatedMatches.value.splice(0);

  for (let i = 0; i < teamsLength; i = i+2) {
    if (i + 1 < teamsLength) {
      generatedMatches.value.push(new Match(generatedTeams.value[i], generatedTeams.value[i + 1]));
    } else {
      generatedMatches.value.push(new Match(generatedTeams.value[i], undefined));
    }
  }
  state.matches = generatedMatches.value;
}

function setMinMaxTeamSkill() {
  const teamSkills: number[] = [];
  for (const team of generatedTeams.value) {
    teamSkills.push(team.getTeamGameSkill());
  }

  state.maxTeamSkill = Math.max(...teamSkills);
  state.minTeamSkill = Math.min(...teamSkills);

}

</script>

<style scoped>

</style>