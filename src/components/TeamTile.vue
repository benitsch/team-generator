<template>
  <div class="team-tile__container">
    <v-row no-gutters>
      <v-col cols="10">
        <v-row no-gutters class="justify-space-between align-center pr-3">
          <h3 class="team-name">{{team.name}}</h3>

          <v-menu
              v-model="menu"
              :close-on-content-click="false"
              location="end"
          >
            <template v-slot:activator="{ props }">
              <v-btn icon density="compact" class="add-player" v-bind="props">
                <v-icon size="15">mdi-account-edit</v-icon>
              </v-btn>
            </template>

            <v-card min-width="250">
              <v-list>
                <v-list-item
                    :title="addSubplayer ? 'Add Subplayer' : 'Add Player'"
                >
                  <template v-slot:append>
                    <v-btn
                        variant="text"
                        :icon="addSubplayer ? 'mdi-account-question-outline' : 'mdi-account-question'"
                        @click="addSubplayer = !addSubplayer"
                    ></v-btn>
                  </template>
                </v-list-item>
              </v-list>

              <v-divider></v-divider>

              <v-list>
                <v-list-item>
                  <v-select
                      v-model="selectedNewPlayers"
                      :items="getAllPossiblePlayersToAdd()"
                      :label="addSubplayer ? 'Subplayers' : 'Players'"
                      multiple
                      density="compact"
                      hide-details
                      item-value="id"
                      item-title="tag"
                  >
                    <template #item="{ item, props }">
                      <v-list-item density="compact" v-bind="props">
                        <template #prepend>
                          <v-checkbox
                              :model-value="isItemChecked(item.value)"
                              hide-details
                              density="compact"
                          >
                          </v-checkbox>
                        </template>
                        <template #title>
                          <v-row no-gutters align="center">
                            <span>{{ item.title }}</span>
                            <v-spacer></v-spacer>
                            <div><v-icon size="20">mdi-arm-flex</v-icon><span>{{ getSkillByPlayerId(item.value) }}</span></div>
                          </v-row>
                        </template>
                      </v-list-item>
                    </template>
                  </v-select>
                </v-list-item>


              </v-list>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    variant="text"
                    @click="menu = false"
                >
                  Cancel
                </v-btn>
                <v-btn
                    color="primary"
                    variant="text"
                    @click="menu = false; automaticallyAddPlayerToTeam()"
                >
                  Auto
                </v-btn>
                <v-btn
                    color="primary"
                    variant="text"
                    @click="menu = false; manuallyAddPlayerToTeam()"
                >
                  Manuel
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>



        </v-row>
        <v-row no-gutters>
          <v-col class="players-list">
            <template v-for="player in team.fixedPlayers" :key="player.id">
              <div class="d-flex name-container">
                <p class="player-name" :title="getPlayerTitleAttr(player)">{{player.tag}}</p>
                <v-icon class="delete-player" @click="removePlayer(player)">mdi-delete-outline</v-icon>
              </div>
            </template>
          </v-col>
          <v-col class="sub-player-list">
            <template v-for="subPlayer in team.substitutionPlayers" :key="subPlayer.id">
              <div class="d-flex name-container">
                <p :title="getPlayerTitleAttr(subPlayer)">{{subPlayer.tag}}</p>
                <v-icon class="delete-player" @click="removePlayer(subPlayer)">mdi-delete-outline</v-icon>
              </div>
            </template>
          </v-col>
        </v-row>
      </v-col>
      <v-divider vertical></v-divider>
      <v-col cols="2" class="team-tile__buttons">
        <v-btn size="25" icon="mdi-arrow-up-bold-circle-outline" class="up"></v-btn>
        <div class="d-flex align-center">
          <v-icon size="20">mdi-arm-flex</v-icon>
          <div>{{team.getTeamGameSkill()}}</div>
        </div>
        <v-btn size="25" icon="mdi-arrow-down-bold-circle-outline" class="down"></v-btn>
      </v-col>

    </v-row>
    <v-snackbar v-model="snackbar" timeout="5000" min-width="0" close-on-content-click>{{errorMessage}}</v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {useMainStore} from "@/stores/main";
import Team from "@/models/Team";
import Player from "@/models/Player";
import Game from "@/models/Game";
import OptimalTeamPlayerSelector from "@/models/TeamPlayerSelector";

const props = defineProps({
  team: {
    type: Team,
    required: true,
  },
  oppositeTeam: {
    type: Team,
    default: null
  },
  game: {
    type: Game,
    required: true
  }
});

const state = useMainStore();

const team = props.team;
const oppositeTeam = props.oppositeTeam;
const game = props.game;

const menu = ref(false);
const addSubplayer = ref(false);
const selectedNewPlayers = ref([]);

const snackbar = ref(false);
const errorMessage = ref("");

function isItemChecked(playerId:string) {
  return selectedNewPlayers.value.find(item => playerId == item) != undefined;
}

function getSkillByPlayerId(playerId:string) {
  const player = getAllPossiblePlayersToAdd().find(player => player.id == playerId);
  return player?.getSkillForGame(game);
}

/*
* Filter from all players those players who are not present in this team.
* */
function getAllPossiblePlayersToAdd() {
  return state.players.filter(player => {
    return !team.isPlayerInTeam(player) && !oppositeTeam?.isPlayerInTeam(player);
  });
}

function manuallyAddPlayerToTeam() {
  selectedNewPlayers.value.forEach(playerId => {
    const player = getAllPossiblePlayersToAdd().find(p => p.id === playerId);
    if (addSubplayer.value) {
      team.addSubstitutionPlayer(player);
    } else {
      team.addPlayer(player);
    }
  });

  clearPlayerSelection();
}

function automaticallyAddPlayerToTeam() {
  const optimalTeamPlayerSelector = new OptimalTeamPlayerSelector();
  const selectablePlayers = getAllPossiblePlayersToAdd();

  const addablePlayers = optimalTeamPlayerSelector.selectPlayers(selectablePlayers, team, state.minTeamSkill, state.maxTeamSkill);
  if (typeof addablePlayers != "number") {
    for(let i = 0; i < addablePlayers.length; i++) {
      if (addSubplayer.value) {
        team?.addSubstitutionPlayer(addablePlayers[i]);
      } else {
        team?.addPlayer(addablePlayers[i]);
      }
    }
  } else {
    console.log("Error Code: " + addablePlayers);
    errorMessage.value = getErrorTextByCode(addablePlayers);
    snackbar.value = true;
  }
  clearPlayerSelection();
}

function getErrorTextByCode(code:number) {
  switch (code) {
    case 1:
      return "There are not enough players to choose from!";
    case 2:
      return "A player has no skill for this game!";
    case 3:
      return "The team is already full!";
    case 4:
      return "The provided list of players contains a player of the team!";
    case 5:
      return "The provided list of players contains duplicates!";
    case 6:
      return "Min team skill exceeds the max team skill!";
    case 7:
      return "The team skill range is negative!";
    default:
      return "Unknown error!"
  }
}

function clearPlayerSelection() {
  // Clear select component values
  selectedNewPlayers.value.splice(0);
}

function getPlayerTitleAttr(player:Player) {
  const currentGameSkill = player.getSkillForGame(team.game);
  return player.firstName + ' ' + player.lastName + ', ' + 'Skill: ' + currentGameSkill;
}

function removePlayer(player:Player) {
  team?.removePlayer(player);
}

</script>

<style scoped>
  .team-tile__container {
    width: 250px;
    border: 1px solid black;
    padding: 10px;
  }

  .team-tile__buttons {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: end;
  }

  .up {
    color: green;
  }

  .down {
    color: red;
  }

  .delete-player {
    color: red;
    cursor: pointer;
    visibility: hidden;
  }

  .name-container:hover .delete-player {
    visibility: visible;
  }

  .players-list, .sub-player-list {
    font-size: 13px;
  }

  .player-name {
    font-weight: bold;
    user-select: none;
  }
</style>