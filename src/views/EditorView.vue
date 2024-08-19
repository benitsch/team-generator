<template>
  <div class="mb-3">
    <h1>Editor</h1>
    <p>You can add, modify and delete players and games.</p>
  </div>
  <v-row>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-title class="d-flex">
          Players&nbsp;({{ state.players.length }})
          <v-spacer></v-spacer>
          <v-btn
            size="small"
            icon="mdi-plus"
            @click="playerDetailDialog = true"
          ></v-btn>
        </v-card-title>
        <v-card-subtitle
          >Manage existing players or add new ones.</v-card-subtitle
        >
        <v-card-text>
          <v-text-field
            v-show="state.players.length > 3"
            class="mx-3"
            density="comfortable"
            label="Search"
            single-line
            prepend-inner-icon="mdi-magnify"
            hide-details
            v-model="playerSearch"
            clearable
            @click:clear="clearPlayerSearch"
          ></v-text-field>
          <v-list class="list">
            <v-list-item
              v-for="(item, i) in filteredPlayers"
              :key="i"
              :value="item"
              prepend-icon="mdi-account-circle-outline"
              @click="showPlayerDetail(item as Player)"
            >
              <v-list-item-title>{{ item.tag }}</v-list-item-title>
              <v-list-item-subtitle>{{
                item.getFullName()
              }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-title class="d-flex">
          Games&nbsp;({{ state.games.length }})
          <v-spacer></v-spacer>
          <v-btn
            size="small"
            icon="mdi-plus"
            @click="gameDetailDialog = true"
          ></v-btn>
        </v-card-title>
        <v-card-subtitle
          >Manage existing games or add new ones.</v-card-subtitle
        >
        <v-card-text>
          <v-text-field
            v-show="state.games.length > 3"
            class="mx-3"
            density="comfortable"
            label="Search"
            single-line
            prepend-inner-icon="mdi-magnify"
            hide-details
            v-model="gameSearch"
            clearable
            @click:clear="clearGameSearch"
          ></v-text-field>
          <v-list class="list">
            <v-list-item
              v-for="(item, i) in filteredGames"
              :key="i"
              :value="item"
              prepend-icon="mdi-controller"
              @click="showGameDetail(item as Game)"
            >
              <v-list-item-title>{{ item.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ item.genre }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  <v-dialog v-model="playerDetailDialog" :scrollable="true" persistent>
    <PlayerDetail
      :playerDetail="playerDetail as Player"
      @cancel-dialog="cancelPlayerDetail"
      @save-player="savePlayerDetail"
      @delete-player="deletePlayerDetail"
    ></PlayerDetail>
  </v-dialog>
  <v-dialog v-model="gameDetailDialog" persistent>
    <GameDetail
      :gameDetail="gameDetail as Game"
      @cancel-dialog="cancelGameDetail"
      @save-game="saveGameDetail"
      @delete-game="deleteGameDetail"
    ></GameDetail>
  </v-dialog>
</template>

<script setup lang="ts">
  import PlayerDetail from '@/components/PlayerDetail.vue';
  import GameDetail from '@/components/GameDetail.vue';
  import type Player from '@/models/Player';
  import type Game from '@/models/Game';
  import { computed, ref } from 'vue';
  import { useMainStore } from '@/stores/main';

  const state = useMainStore();

  const playerDetailDialog = ref<boolean>(false);
  const playerDetail = ref<Player | null>(null);
  const gameDetailDialog = ref<boolean>(false);
  const gameDetail = ref<Game | null>(null);

  const gameSearch = ref('');
  const playerSearch = ref('');

  function clearGameSearch(): void {
    gameSearch.value = '';
  }

  function clearPlayerSearch(): void {
    playerSearch.value = '';
  }

  const filteredGames = computed(() => {
    return state.games.filter((item) => {
      if (!gameSearch.value) return state.games;
      return (
        item.name.toLowerCase().includes(gameSearch.value.toLowerCase()) ||
        item.genre.toLowerCase().includes(gameSearch.value.toLowerCase())
      );
    });
  });

  const filteredPlayers = computed(() => {
    return state.players.filter((item) => {
      if (!playerSearch.value) return state.players;
      return (
        item.tag.toLowerCase().includes(playerSearch.value.toLowerCase()) ||
        item.firstName
          .toLowerCase()
          .includes(playerSearch.value.toLowerCase()) ||
        item.lastName.toLowerCase().includes(playerSearch.value.toLowerCase())
      );
    });
  });

  function savePlayerDetail(newPlayer: Player): void {
    const existingPlayerIdx = state.players.findIndex(
      (player) => player.id === playerDetail?.value?.id,
    );
    if (existingPlayerIdx !== -1) {
      state.players[existingPlayerIdx] = newPlayer;
    } else {
      state.addPlayer(newPlayer);
    }
    resetPlayerDetail();
  }

  function deletePlayerDetail(): void {
    const existingPlayerIdx = state.players.findIndex(
      (player) => player.id === playerDetail?.value?.id,
    );
    if (existingPlayerIdx !== -1) {
      state.players.splice(existingPlayerIdx, 1);
    }
    resetPlayerDetail();
  }

  // FIXME when i change the gameskill of an existing player, it will save the value even if you press "Cancel" in the dialog.
  function cancelPlayerDetail(): void {
    resetPlayerDetail();
  }

  function resetPlayerDetail(): void {
    playerDetail.value = null;
    playerDetailDialog.value = false;
  }

  // FIXME when you open an existing player and close the pop up via ESC button -> click on new player via + button, you'll see the details of the existing player (same for games)
  // FIXME when you just click esc, it will not trigger the resetGameDetail function, but when you click within the dialog and then press esc, it will work ....
  // FIXME maybe listen on parent on esc press as well and check if playerDetailDialog is true (if dialog is open) ...

  function showPlayerDetail(player: Player): void {
    playerDetail.value = player;
    playerDetailDialog.value = true;
  }

  function saveGameDetail(newGame: Game): void {
    const existingGameIdx = state.games.findIndex(
      (game) => game.id === gameDetail?.value?.id,
    );
    if (existingGameIdx !== -1) {
      state.games[existingGameIdx] = newGame;
    } else {
      state.addGame(newGame);
    }
    resetGameDetail();
  }

  function deleteGameDetail(): void {
    const existingGameIdx = state.games.findIndex(
      (game) => game.id === gameDetail?.value?.id,
    );
    if (existingGameIdx !== -1) {
      state.games.splice(existingGameIdx, 1);
    }
    resetGameDetail();
  }

  function cancelGameDetail(): void {
    resetGameDetail();
  }

  function resetGameDetail(): void {
    gameDetail.value = null;
    gameDetailDialog.value = false;
  }

  function showGameDetail(game: Game): void {
    gameDetail.value = game;
    gameDetailDialog.value = true;
  }

  // TODO(bn) Possible refactoring: Add new or edit is quite similar, now we just differ with a detail variable called e.g. playerDetail or gameDetail
</script>

<style scoped>
  .list {
    max-height: 300px;
  }
</style>
