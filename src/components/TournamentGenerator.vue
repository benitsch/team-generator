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
          <template #prepend-item>
            <v-list-item title="Select All" @click="toggleSelectAll">
              <template #prepend>
                <v-checkbox-btn
                  :color="
                    someParticipantsSelected() ? 'indigo-darken-4' : undefined
                  "
                  :indeterminate="
                    someParticipantsSelected() && !allParticipantsSelected()
                  "
                  :model-value="allParticipantsSelected()"
                ></v-checkbox-btn>
              </template>
            </v-list-item>

            <v-divider class="mt-2"></v-divider>
          </template>
<!--          <template #selection="{ item, index }">-->
<!--            <span>{{ item.title }}</span>-->
<!--          </template>-->
<!--          <template #selection="{ item, index }">-->
<!--            <v-chip v-if="index < 2">-->
<!--              <span>{{ item.title }}</span>-->
<!--            </v-chip>-->
<!--            <span-->
<!--              v-if="index === 2"-->
<!--              class="text-grey text-caption align-self-center"-->
<!--            >-->
<!--        (+{{ value.length - 2 }} others)-->
<!--      </span>-->
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
        <v-btn
          elevation="2"
          prepend-icon="mdi-tournament"
          @click="generateTeams"
        >
          Generate
        </v-btn>
      </v-card-actions>
    </v-card>

    <div class="matches-container d-flex flex-wrap">
      <template v-for="match in generatedMatches" :key="match.id">
        <TeamMatch
          :match="match as Match"
          :game="getGameBySelectedId()"
        ></TeamMatch>
      </template>
    </div>

    <v-snackbar
      v-model="snackbar"
      timeout="5000"
      min-width="0"
      close-on-content-click
      >{{ errorMessage }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
  // This component has multiple TeamMatch components to create a tournament tree.

  import { ref } from 'vue';
  import TeamMatch from '@/components/TeamMatch.vue';
  import { useMainStore } from '@/stores/main';
  import BalancedRandomTeamGenerator, {
    GeneratorErrorCode,
  } from '@/models/TeamGenerator';
  import Game from '@/models/Game';
  import Team from '@/models/Team';
  import Player from '@/models/Player';
  import Match from '@/models/Match';

  const state = useMainStore();

  const selectedParticipants = ref<string[]>([]);
  const selectedGameId = ref();
  const teamSize = ref();
  const possibleTeamSizes = [2, 3, 4, 5, 6, 7, 8, 9, 10];

  const generatedTeams = ref<Team[]>([]);
  const generatedMatches = ref<Match[]>(state.matches as Match[]);

  const snackbar = ref(false);
  const errorMessage = ref('');

  function generateTeams(): void {
    const players: Array<Player> = getPlayerById(selectedParticipants.value);
    const game: Game = getGameBySelectedId();
    generatedTeams.value.splice(0);

    const balancedRandomTeamGenerator = new BalancedRandomTeamGenerator();
    const teams: Array<Team> | GeneratorErrorCode =
      balancedRandomTeamGenerator.generate(players, teamSize.value, game);
    if (typeof teams !== 'number') {
      for (let i = 0; i < teams.length; i++) {
        generatedTeams.value.push(teams[i]);
      }
    } else {
      console.log('Error Code: ' + teams);
      errorMessage.value = getErrorTextByCode(teams);
      snackbar.value = true;
    }
    setMinMaxTeamSkill();
    generatedTeamsAsMatchPair();
  }

  function allParticipantsSelected(): boolean {
    return selectedParticipants.value.length === state.players.length;
  }

  function someParticipantsSelected(): boolean {
    return selectedParticipants.value.length > 0;
  }

  function toggleSelectAll(): void {
    if (allParticipantsSelected()) {
      selectedParticipants.value.splice(0);
    } else {
      selectedParticipants.value = [...state.players.map((player) => player.id)];
    }
  }

  function getPlayerById(playerIds: string[]): Player[] {
    return state.players.filter((player) =>
      playerIds.includes(player.id),
    ) as Player[];
  }

  function getErrorTextByCode(code: number): string {
    switch (code) {
      case 1:
        return 'Team size and player length mismatch!';
      case 2:
        return 'A player has no skill for this game!';
      case 3:
        return 'The player list contains duplicates!';
      default:
        return 'Unknown error!';
    }
  }

  function getGameBySelectedId(): Game {
    const selectedGame = state.games.find(
      (game) => game.id === selectedGameId.value,
    );
    return (selectedGame ?? new Game()) as Game;
  }

  function generatedTeamsAsMatchPair(): void {
    const teamsLength = generatedTeams.value.length;
    generatedMatches.value.splice(0);

    for (let i = 0; i < teamsLength; i = i + 2) {
      if (i + 1 < teamsLength) {
        generatedMatches.value.push(
          new Match(
            generatedTeams.value[i] as Team,
            generatedTeams.value[i + 1] as Team,
          ),
        );
      } else {
        generatedMatches.value.push(
          new Match(generatedTeams.value[i] as Team, undefined),
        );
      }
    }
    state.matches = generatedMatches.value;
  }

  function setMinMaxTeamSkill(): void {
    const teamSkills: number[] = [];
    for (const team of generatedTeams.value) {
      teamSkills.push(team.getTeamGameSkill());
    }

    state.maxTeamSkill = Math.max(...teamSkills);
    state.minTeamSkill = Math.min(...teamSkills);
  }
</script>
