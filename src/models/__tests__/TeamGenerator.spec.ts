import { describe, it, expect } from "vitest";

import Team from "../Team";
import Player from "../Player";
import GameSkill from "../GameSkill";
import Game from "../Game";
import TeamGenerator from "../TeamGenerator";
import BalancedRandomTeamGenerator from "../TeamGenerator";
import { GeneratorErrorCode } from "../TeamGenerator";

describe("Generate Team Test", () => {

    const game: Game = new Game("HOTS", "MOBA");


    it("Shall generate the expected amount of teams of expected target size.", () => {

        const teamSize: number = 3;
        const amountOfPlayers = 9;
    
        let players: Array<Player> = new Array<Player>();
    
        for(let i = 0; i < amountOfPlayers; i++){
            let player: Player = new Player("Player"+i);
            player.addGameSkill(new GameSkill(game, i%5 + 1));
            players.push(player);
        }

        let generator: TeamGenerator = new BalancedRandomTeamGenerator();
        const generateResult: Array<Team> | GeneratorErrorCode = generator.generate(players, teamSize, game);
        expect(generateResult).instanceOf(Array<Team>);

        const teams: Array<Team> = generateResult as Array<Team>;

        expect(teams.length).toEqual(3);

        for (let team of teams){
            expect(team.targetSize === teamSize);
            expect(team.isFull).toBeTruthy;
        }
     
    });
   
 
  });