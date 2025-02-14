<template>
  <div class="tournament-generator__container">
    <v-card>
      <v-card-title>Create a tournament</v-card-title>
      <v-card-text>
        <v-select
          v-model="selectedGameId"
          class="mb-4"
          :items="state.games"
          item-title="name"
          item-value="id"
          label="Game"
          :hint="`Total number of Games: ${state.games.length}`"
          persistent-hint
        ></v-select>
        <v-select
          v-model="selectedParticipants"
          class="mb-4"
          :items="filterPlayersByGame"
          label="Player"
          multiple
          item-value="id"
          item-title="tag"
          :hint="`Total number of Players: ${selectedParticipants.length}/${filterPlayersByGame.length}`"
          persistent-hint
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
        </v-select>
        <v-select
          v-model="teamSize"
          :items="possibleTeamSizeOptions"
          label="Team size"
        ></v-select>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          elevation="2"
          prepend-icon="mdi-tournament"
          :disabled="disableGenerateTeamsBtn"
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

  import { computed, ref, watch } from 'vue';
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

  const selectedGameId = ref<string>();
  const selectedParticipants = ref<string[]>([]);
  const teamSize = ref();
  const possibleTeamSizeOptions = [2, 3, 4, 5, 6, 7, 8, 9, 10];

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
    return selectedParticipants.value.length === filterPlayersByGame.value.length;
  }

  function someParticipantsSelected(): boolean {
    return selectedParticipants.value.length > 0;
  }

  function toggleSelectAll(): void {
    if (allParticipantsSelected()) {
      selectedParticipants.value.splice(0);
    } else {
      selectedParticipants.value = [
        ...filterPlayersByGame.value.map((player) => player.id),
      ];
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

  const disableGenerateTeamsBtn = computed(() => {
    return selectedGameId.value === undefined || selectedParticipants.value.length === 0 || teamSize.value === undefined
  });

  const filterPlayersByGame = computed(() => {
    return state.players.filter((player) => {
      const selectedGame = player.gameSkills.find((game) => game.game.id === selectedGameId.value);
      return selectedGame && selectedGame.skillLevel > 0;
    });
  });

  watch(selectedGameId, () => {
    selectedParticipants.value.splice(0);
  });
</script>
