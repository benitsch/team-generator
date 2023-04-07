<template>
  <v-form ref="form">
    <v-card min-width="250px">
      <v-card-title class="d-flex">
        {{ title }}
        <v-spacer></v-spacer>
        <v-btn v-if="isEdit" color="red" variant="outlined" size="small" icon="mdi-delete" title="Delete Player"
               @click="emit('deletePlayer')"></v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-subtitle>Player details</v-card-subtitle>
      <v-card-text>
        <v-text-field
            v-model="player.tag"
            label="Player tag"
            variant="outlined"
            :rules="[rules.required]"
        ></v-text-field>
        <v-text-field
            v-model="player.firstName"
            label="First name"
            variant="outlined"
            :rules="[rules.required]"
        ></v-text-field>
        <v-text-field
            v-model="player.lastName"
            label="Last name"
            variant="outlined"
            :rules="[rules.required]"
        ></v-text-field>
      </v-card-text>
      <v-card-subtitle v-show="state.games.length">Game skills</v-card-subtitle>
      <v-card-text style="max-height:300px">
        <template v-for="(game, i) in state.games"
                  :key="i">
          <div class="text-caption">{{ game.name }}</div>
          <v-slider
              v-model="player.gameSkills[i].skillLevel"
              :ticks="gameTickLabels"
              :max="5"
              step="1"
              show-ticks="always"
              tick-size="4"
          ></v-slider>
        </template>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="justify-end">
        <v-btn
            elevation="2"
            color="red darken-1"
            text
            @click="emit('cancelDialog')"
        >
          Cancel
        </v-btn>
        <v-btn elevation="2" color="green darken-1" text @click="submit">
          {{isEdit ? 'Edit' : 'Add'}}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";
import Player from "@/models/Player";
import {useMainStore} from "@/stores/main";
import GameSkill from "@/models/GameSkill";
import Game from "@/models/Game";

const state = useMainStore();

const emit = defineEmits(["savePlayer", "cancelPlayer", "deletePlayer", "cancelDialog"]);
const props = defineProps({
  playerDetail: {
    type: Player,
    // default: null
  }
});

const isEdit = computed(() => {
  return props.playerDetail?.id !== undefined;
});

const form = ref();
const title = ref<string>(isEdit.value ? "Edit player" : "Add new player");

const player = ref<Player>(new Player());
player.value.tag = props.playerDetail?.tag ?? "";
player.value.firstName = props.playerDetail?.firstName ?? "";
player.value.lastName = props.playerDetail?.lastName ?? "";
player.value.gameSkills = props.playerDetail?.gameSkills ?? [];

ensureGameSkills();

const gameTickLabels = [0, 1, 2, 3, 4, 5];

const rules = ref({
  required: (value: string) => !!value || "Field is required"
});

async function submit() {
  const isValid = await form.value.validate();
  if (isValid.valid) {
    emit("savePlayer", player.value);
  }
}

/*
* If it is a new player we need to add each game to the gameskills array.
* If the player already exists, but a new game exists which is not in players gameSkills array, we need to add as well.
* */
function ensureGameSkills() {
  if (player.value.gameSkills.length === 0 || player.value.gameSkills.length !== state.games.length) {
    state.games.forEach(game => {
      if (!player.value.gameSkills.some(skill => skill.game?.id === game.id)) {
        const gameSkill = new GameSkill();
        gameSkill.game = new Game();
        player.value.gameSkills.push(gameSkill);
      }
    });
  }
}


// TODO next to player tag required rule, also a check if tag already exist in player array;
</script>

<style scoped></style>
