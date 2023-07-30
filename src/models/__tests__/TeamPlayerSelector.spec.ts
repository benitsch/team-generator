import { describe, it, expect } from "vitest";

import Game from "../Game";
import Team from "../Team";
import Player from "../Player";
import TeamPlayerSelector from "../TeamPlayerSelector";
import {SelectorErrorCode } from "../TeamPlayerSelector";
import GameSkill from "../GameSkill";


describe("Select Suitable Players Test", () => {

    const game: Game = new Game("HOTS", "MOBA");

    let lonePlayer: Player = new Player("TheLoneWolf", "Jon", "Doe");
    lonePlayer.addGameSkill(new GameSkill(game, 3));

    let team: Team = new Team("HotOnes", 5, game);
    team.addPlayer(lonePlayer);


    it("Shall select exact missing amount of players within given skill range if possible.", () => {

        let selectablePlayers: Array<Player> = new Array<Player>();
        for (let i = 0; i < 10; i++){
            let player: Player = new Player("Player" + i);
            player.addGameSkill(new GameSkill(game, (i % 5) + 1));
            selectablePlayers.push(player);
        }

        const minTeamSkill: number = 10;
        const maxTeamSkill: number = 20;
    
        const selectResult: Array<Player> | SelectorErrorCode = TeamPlayerSelector.selectSuitablePlayers(selectablePlayers, team, minTeamSkill, maxTeamSkill);
        console.log("RESULT CODE = " + selectResult);
        expect(selectResult).instanceOf(Array<Player>);

        const selectedPlayers: Array<Player> = selectResult as Array<Player>;

        expect(selectedPlayers.length).toEqual(team.targetSize - team.currentSize);

        let totalTeamSkill: number = team.getTeamGameSkill();
        for (let player of selectedPlayers){
            totalTeamSkill += player.getSkillForGame(game);
        }

        expect(totalTeamSkill >= minTeamSkill);
        expect(totalTeamSkill <= maxTeamSkill);
     
    });
   
 
  });