import { defineStore } from "pinia";
import type Player from "@/models/Player";
import type Game from "@/models/Game";
import JsonObject from "@/models/JsonObject";

export const useMainStore = defineStore({
  id: "main",
  state: () => ({
    player: [] as Player[],
    games: [] as Game[]
  }),
  getters: {
    getJson: function(state) {
      // TODO generate json object to use in first Tab for download
      const jsonObj = new JsonObject();
      // const games: Game = state.games;
      // state.games.forEach(function(game) {
      //   jsonObj.games[] = game;
      // });
      // jsonObj.games = Array.from(games);

      return JSON.stringify(jsonObj);
    }
  },
  actions: {
    addPlayer(player: Player) {
      this.player.push(player);
    },
    addGame(game: Game) {
      this.games.push(game);
    },
    uploadJson() {
      // TODO when upload btn is pressed, we need to validate json schema and init states of data from json content
    },
    downloadJson() {
      // TODO call getters - getJson and generate json file for download
    }
  }
});
