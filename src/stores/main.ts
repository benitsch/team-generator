import {defineStore} from "pinia";
import Player from "@/models/Player";
import Game from "@/models/Game";
import JsonObject from "@/models/JsonObject";
import GameSkill from "@/models/GameSkill";

export const useMainStore = defineStore({
    id: "main",
    state: () => ({
        players: [] as Player[],
        games: [] as Game[]
    }),
    getters: {
        getJson: function (state) {
            const jsonObj = new JsonObject();
            Object.assign(jsonObj.players, state.players);
            Object.assign(jsonObj.games, state.games);

            return JSON.stringify(jsonObj);
        }
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
                const player = new Player();
                player.id = playerData._id;
                player.tag = playerData._tag;
                player.firstName = playerData._firstName;
                player.lastName = playerData._lastName;
                player.gameSkills = playerData._gameSkills.map((skillData: any) => {
                    const gameSkill = new GameSkill();
                    gameSkill.id = skillData._id;
                    gameSkill.game = new Game();
                    gameSkill.game.id = skillData._game._id;
                    gameSkill.game.name = skillData._game._name;
                    gameSkill.game.genre = skillData._game._genre;
                    gameSkill.skillLevel = skillData._skillLevel;
                    return gameSkill;
                });
                return player;
            });

            const games = data._games.map((gameData: any) => {
                const game = new Game();
                game.id = gameData._id;
                game.name = gameData._name;
                game.genre = gameData._genre;
                return game;
            });

            this.$state.players = players;
            this.$state.games = games;
        },
    }
});
