import { describe, it, expect } from "vitest";
import { imock, instance, when, thenReturn } from "@johanblumenberg/ts-mockito"

import Game from "../Game";
import Team from "../Team";
import Player from "../Player";
import TeamPlayerSelector from "../TeamPlayerSelector";
import OptimalTeamPlayerSelector from "../TeamPlayerSelector";
import {SelectorErrorCode } from "../TeamPlayerSelector";
import GameSkill from "../GameSkill";
import RandomSource from "../RandomSource";
import DefaultRandomSource from "../RandomSource";

class OptimalTeamSelectorUnderTest extends OptimalTeamPlayerSelector {
    constructor(randomSource: RandomSource = new DefaultRandomSource()){
        super(randomSource);
    }

    public validateSelectorInput(players: Player[], team: Team): SelectorErrorCode | undefined {
        return super.validateSelectorInput(players, team);
    }
    
    public selectRandomPlayers(players: Player[], amount: number): [Player[], Player[]] {
        return super.selectRandomPlayers(players, amount);
    }

    public optimizePlayerSelectionOutOfRange(currentPlayerSelection: Player[], alternativePlayers: Player[], team: Team, minTeamSkill: number, maxTeamSkill: number): Player[] {
        return super.optimizePlayerSelectionOutOfRange(currentPlayerSelection, alternativePlayers, team, minTeamSkill, maxTeamSkill);
    }
}


describe("Select Suitable Players Test", () => {

    const game: Game = new Game("HOTS", "MOBA");

    let lonePlayer: Player = new Player("TheLoneWolf", "Jon", "Doe");
    lonePlayer.addGameSkill(new GameSkill(game, 3));

    let team: Team = new Team("HotOnes", 5, game);
    team.addPlayer(lonePlayer);

    let selector: TeamPlayerSelector = new OptimalTeamSelectorUnderTest();


    it("Shall select exact missing amount of players within given skill range if possible.", () => {

        let selectablePlayers: Array<Player> = new Array<Player>();
        for (let i = 0; i < 10; i++){
            let player: Player = new Player("Player" + i);
            player.addGameSkill(new GameSkill(game, (i % 5) + 1));
            selectablePlayers.push(player);
        }

        const minTeamSkill: number = 10;
        const maxTeamSkill: number = 20;
    
        const selectResult: Array<Player> | SelectorErrorCode = selector.selectPlayers(selectablePlayers, team, minTeamSkill, maxTeamSkill);
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

    it("Shall ensure that random player selection part is based on a random source.", () => {

        let selectablePlayers: Array<Player> = new Array<Player>();
        for (let i = 0; i < 10; i++){
            let player: Player = new Player("Player" + i);
            player.addGameSkill(new GameSkill(game, (i % 5) + 1));
            selectablePlayers.push(player);
        }

        const mockRandomSource: RandomSource = imock();
        let selector: OptimalTeamSelectorUnderTest = new OptimalTeamSelectorUnderTest(instance(mockRandomSource));
        let amountOfPlayersToSelect: number = 3;
        when(mockRandomSource.getRandomNumber()).thenReturn(0).thenReturn(1).thenReturn(2);

        let [randomPlayerSelection, alternativePlayers] = selector.selectRandomPlayers(selectablePlayers, amountOfPlayersToSelect);

        for (let i = 0; i < selectablePlayers.length; i++){
            if (i <= 2){
                expect(selectablePlayers.at(i) === randomPlayerSelection.at(i));
            }else{
                expect(selectablePlayers.at(i) === alternativePlayers.at(i + randomPlayerSelection.length));
            }
        }
     
    });
   
 
  });