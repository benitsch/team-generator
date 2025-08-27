import { defineStore } from 'pinia';
import Player from '@/models/Player';
import Game from '@/models/Game';
import JsonObject from '@/models/JsonObject';
import GameSkill from '@/models/GameSkill';
import type Match from '@/models/Match';

export const useMainStore = defineStore('main', {
  state: () => ({
    players: [] as Player[],
    games: [] as Game[],
    matches: [] as Match[],
    minTeamSkill: 0 as number,
    maxTeamSkill: 0 as number,
  }),
  getters: {
    getJson: function (state) {
      const jsonObj = new JsonObject();
      Object.assign(jsonObj.players, state.players);
      Object.assign(jsonObj.games, state.games);

      return JSON.stringify(jsonObj, null, 2);
    },
  },
  actions: {
    addPlayer(player: Player) {
      this.players.push(player);
    },
    addGame(game: Game) {
      this.games.push(game);
    },
    setStateFromJson(content: string) {
      const data = JSON.parse(content);

      const players = data._players.map((playerData: any) => {
        const player = new Player(
          playerData._tag,
          playerData._firstName,
          playerData._lastName,
        );
        player.id = playerData._id;
        player.gameSkills = playerData._gameSkills.map((skillData: any) => {
          const gameSkill = new GameSkill(new Game(), skillData._skillLevel);
          gameSkill.id = skillData._id;
          gameSkill.game.id = skillData._game._id;
          gameSkill.game.name = skillData._game._name;
          gameSkill.game.genre = skillData._game._genre;
          return gameSkill;
        });
        return player;
      });

      const games = data._games.map((gameData: any) => {
        const game = new Game(gameData._name, gameData._genre);
        game.id = gameData._id;
        return game;
      });

      this.$state.players = players;
      this.$state.games = games;
    },
  },
});
