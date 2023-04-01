<template>
  <div class="mb-3">
    <h1>This is the Editor view</h1>
    <p>You can add, modify and delete players and games.</p>
  </div>
  <v-row>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-title class="d-flex">
          Player
          <v-spacer></v-spacer>
          <v-btn size="small" icon="mdi-plus" @click="playerDetailDialog = true"></v-btn>
        </v-card-title>
        <v-card-subtitle>Manage existing players or add new ones.</v-card-subtitle>
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="(item, i) in state.player"
              :key="i"
              :value="item"
              prepend-icon="mdi-account-circle-outline"
              @click="showPlayerDetail(item)"
            >
              <v-list-item-content>
                <v-list-item-title>{{ item.tag }}</v-list-item-title>
                <v-list-item-subtitle>{{ item.getFullName() }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-title class="d-flex">
          Games
          <v-spacer></v-spacer>
          <v-btn size="small" icon="mdi-plus" @click="gameDetailDialog = true"></v-btn>
        </v-card-title>
        <v-card-subtitle>Manage existing games or add new ones.</v-card-subtitle>
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="(item, i) in state.games"
              :key="i"
              :value="item"
              prepend-icon="mdi-controller"
              @click="showGameDetail(item)"
            >
              <v-list-item-content>
                <v-list-item-title>{{ item.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ item.genre }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  <!-- FIXME scrollable is not available/fixed in vuetify 3 beta at the moment -->
  <v-dialog v-model="playerDetailDialog" :scrollable="true">
    <PlayerDetail
      :playerDetail="playerDetail"
      @cancel-dialog="cancelPlayerDetail"
      @save-player="savePlayerDetail"
      @delete-player="deletePlayerDetail"
    ></PlayerDetail>
  </v-dialog>
  <v-dialog v-model="gameDetailDialog">
    <GameDetail
      :gameDetail="gameDetail"
      @cancel-dialog="cancelGameDetail"
      @save-game="saveGameDetail"
      @delete-game="deleteGameDetail"
    ></GameDetail>
  </v-dialog>
</template>

<script setup lang="ts">
import PlayerDetail from "@/components/PlayerDetail.vue";
import GameDetail from "@/components/GameDetail.vue";
import type Player from "@/models/Player";
import type Game from "@/models/Game";
import { ref } from "vue";
import { useMainStore } from "@/stores/main";

const state = useMainStore();

const playerDetailDialog = ref<boolean>(false);
const playerDetail = ref<Player | null>();
const gameDetailDialog = ref<boolean>(false);
const gameDetail = ref<Game | null>();

function savePlayerDetail(newPlayer: Player) {
  const existingPlayerIdx = state.player.findIndex(player => player.id === playerDetail?.value?.id);
  if (existingPlayerIdx !== -1) {
    state.player[existingPlayerIdx] = newPlayer;
  } else {
    state.addPlayer(newPlayer);
  }
  resetPlayerDetail();
}

function deletePlayerDetail() {
  const existingPlayerIdx = state.player.findIndex(player => player.id === playerDetail?.value?.id);
  if (existingPlayerIdx !== -1) {
    state.player.splice(existingPlayerIdx, 1)
  }
  resetPlayerDetail();
}

function cancelPlayerDetail() {
  resetPlayerDetail();
}

function resetPlayerDetail() {
  playerDetail.value = null;
  playerDetailDialog.value = false;
}

// FIXME when you open an existing player and close the pop up via ESC button -> click on new player via + button, you'll see the details of the existing player (same for games)

function showPlayerDetail(player: Player) {
  playerDetail.value = player;
  playerDetailDialog.value = true;
}

function saveGameDetail(newGame: Game) {
  const existingGameIdx = state.games.findIndex(game => game.id === gameDetail?.value?.id);
  if (existingGameIdx !== -1) {
    state.games[existingGameIdx] = newGame;
  } else {
    state.addGame(newGame);
  }
  resetGameDetail();
}

function deleteGameDetail() {
  const existingGameIdx = state.games.findIndex(game => game.id === gameDetail?.value?.id);
  if (existingGameIdx !== -1) {
    state.games.splice(existingGameIdx, 1)
  }
  resetGameDetail();
}

function cancelGameDetail() {
  resetGameDetail();
}

function resetGameDetail() {
  gameDetail.value = null;
  gameDetailDialog.value = false;
}

function showGameDetail(game: Game) {
  gameDetail.value = game;
  gameDetailDialog.value = true;
}

// TODO Possible refactoring: Add new or edit is quite similar, now we just differ with a detail variable called e.g. playerDetail or gameDetail
</script>

<style scoped></style>
