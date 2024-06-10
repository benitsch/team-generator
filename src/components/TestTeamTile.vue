<script setup lang="ts">

</script>

<template>
  <div class="team-tile__container">
    <v-row no-gutters>
      <v-col cols="10">
        <v-row no-gutters class="justify-space-between align-center pr-3">
          <h3 class="team-name">Team Name</h3>
        </v-row>
        <v-row no-gutters>
          <v-col class="players-list">
            <div class="d-flex name-container">
              <p class="player-name">Player Tag</p>
            </div>
          </v-col>
          <v-col class="sub-player-list">
            <div class="d-flex name-container">
              <p>Subplayer Tag</p>
            </div>
          </v-col>
        </v-row>
      </v-col>
      <v-divider vertical></v-divider>
      <v-col cols="2" class="team-tile__buttons">
        <v-btn size="25" icon="mdi-arrow-up-bold-circle-outline" class="up"></v-btn>
        <div class="d-flex align-center">
          <v-icon size="20">mdi-arm-flex</v-icon>
          <div>12</div>
        </div>
        <v-btn size="25" icon="mdi-arrow-down-bold-circle-outline" class="down"></v-btn>
      </v-col>

    </v-row>
  </div>
</template>

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