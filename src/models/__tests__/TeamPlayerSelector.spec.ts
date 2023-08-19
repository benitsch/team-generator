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

    public validateSelectorInput(players: Player[], team: Team, minTeamSkill: number, maxTeamSkill: number): SelectorErrorCode | undefined {
        return super.validateSelectorInput(players, team, minTeamSkill, maxTeamSkill);
    }
    
    public selectRandomPlayers(players: Player[], amount: number): [Player[], Player[]] {
        return super.selectRandomPlayers(players, amount);
    }

    public optimizePlayerSelectionOutOfRange(currentPlayerSelection: Player[], alternativePlayers: Player[], team: Team, minTeamSkill: number, maxTeamSkill: number): Player[] {
        return super.optimizePlayerSelectionOutOfRange(currentPlayerSelection, alternativePlayers, team, minTeamSkill, maxTeamSkill);
    }
}


describe("OptimalTeamPlayerSelectorInterfaceTest", () => {

    const game: Game = new Game("HOTS", "MOBA");

    let lonePlayer: Player = new Player("TheLoneWolf", "Jon", "Doe");
    lonePlayer.addGameSkill(new GameSkill(game, 3));

    let team: Team = new Team("HotOnes", 5, game);
    team.addPlayer(lonePlayer);

    let selectablePlayers: Array<Player> = new Array<Player>();
    for (let i = 0; i < 10; i++){
        let player: Player = new Player("Player" + i);
        player.addGameSkill(new GameSkill(game, (i % 5) + 1));
        selectablePlayers.push(player);
    }

    let selector: TeamPlayerSelector = new OptimalTeamPlayerSelector();

    it("Shall not accept empty selectable player list", () => {

        const minTeamSkill: number = -10;
        const maxTeamSkill: number = 10;
    
        const selectorResult: Array<Player> | SelectorErrorCode = selector.selectPlayers(new Array<Player>(), team, minTeamSkill, maxTeamSkill);
        expect(selectorResult).toBeTypeOf("number");

        const errorCode: SelectorErrorCode = selectorResult as SelectorErrorCode;
        expect(errorCode).toEqual(SelectorErrorCode.TeamSkillRangeNegative);
        
     
    });
    

    it("Shall select exact missing amount of players within given skill range if possible.", () => {

        const minTeamSkill: number = 10;
        const maxTeamSkill: number = 20;
    
        const selectResult: Array<Player> | SelectorErrorCode = selector.selectPlayers(selectablePlayers, team, minTeamSkill, maxTeamSkill);
        expect(selectResult).instanceOf(Array<Player>);

        const selectedPlayers: Array<Player> = selectResult as Array<Player>;

        expect(selectedPlayers.length).toEqual(team.targetSize - team.currentSize);

        let totalTeamSkill: number = team.getTeamGameSkill();
        for (let player of selectedPlayers){
            totalTeamSkill += player.getSkillForGame(game);
        }

        expect(totalTeamSkill).toBeGreaterThanOrEqual(minTeamSkill);
        expect(totalTeamSkill).toBeLessThanOrEqual(maxTeamSkill);
     
    });
   
 
  });

  describe("OptimalTeamPlayerSelectorClassTest", () => {

    const game: Game = new Game("HOTS", "MOBA");

    let lonePlayer: Player = new Player("TheLoneWolf", "Jon", "Doe");
    lonePlayer.addGameSkill(new GameSkill(game, 3));

    let team: Team = new Team("HotOnes", 5, game);
    team.addPlayer(lonePlayer);

    let selectablePlayers: Array<Player> = new Array<Player>();
    for (let i = 0; i < 10; i++){
        let player: Player = new Player("Player" + i);
        player.addGameSkill(new GameSkill(game, (i % 5) + 1));
        selectablePlayers.push(player);
    }

    const mockRandomSource: RandomSource = imock();
    let selector: OptimalTeamSelectorUnderTest = new OptimalTeamSelectorUnderTest(instance(mockRandomSource));

    it("Shall not accept negative team skill range", () => {

        const minTeamSkill: number = -10;
        const maxTeamSkill: number = 10;
    
        const validateResult: SelectorErrorCode | undefined = selector.validateSelectorInput(selectablePlayers, team, minTeamSkill, maxTeamSkill);
        expect(validateResult).toBeTypeOf("number");

        const errorCode: SelectorErrorCode = validateResult as SelectorErrorCode;
        expect(errorCode).toEqual(SelectorErrorCode.TeamSkillRangeNegative);
        
     
    });

    it("Shall not accept min skill exceeding max skill", () => {

        const minTeamSkill: number = 20;
        const maxTeamSkill: number = 10;
    
        const validateResult: SelectorErrorCode | undefined = selector.validateSelectorInput(selectablePlayers, team, minTeamSkill, maxTeamSkill);
        expect(validateResult).toBeTypeOf("number");

        const errorCode: SelectorErrorCode = validateResult as SelectorErrorCode;
        expect(errorCode).toEqual(SelectorErrorCode.MinTeamSkillExceedsMax);
        
     
    });

    it("Shall not accept selecting players if team is already full!", () => {

        const minTeamSkill: number = 10;
        const maxTeamSkill: number = 20;

        let fullTeam: Team = new Team("NoSpaceLeft", 5, game);

        for (let i = fullTeam.allPlayers.length; i < fullTeam.targetSize; i++){ //fill up team
            let player: Player = new Player("Player" + i);
            player.addGameSkill(new GameSkill(game, 3));
            fullTeam.addPlayer(player);
        }
    
        const validateResult: SelectorErrorCode | undefined = selector.validateSelectorInput(selectablePlayers, fullTeam, minTeamSkill, maxTeamSkill);
        expect(validateResult).toBeTypeOf("number");

        const errorCode: SelectorErrorCode = validateResult as SelectorErrorCode;
        expect(errorCode).toEqual(SelectorErrorCode.TeamAlreadyFull);
        
     
    });

    it("Shall not accept dupicates in selectable player list.", () => {

        const minTeamSkill: number = 10;
        const maxTeamSkill: number = 20;

        let duplicatePlayerList: Array<Player> = new Array<Player>();

        for (let i = 0; i < 10; i++){
            let player: Player = new Player("Player" + i);
            player.addGameSkill(new GameSkill(game, (i % 5) + 1));
            duplicatePlayerList.push(player);
        }

        let duplicatePlayer: Player = new Player("DuplicatePlayer");
        duplicatePlayer.addGameSkill(new GameSkill(game, 3));
        duplicatePlayerList.push(duplicatePlayer);
        duplicatePlayerList.push(duplicatePlayer);
    
        const validateResult: SelectorErrorCode | undefined = selector.validateSelectorInput(duplicatePlayerList, team, minTeamSkill, maxTeamSkill);
        expect(validateResult).toBeTypeOf("number");

        const errorCode: SelectorErrorCode = validateResult as SelectorErrorCode;
        expect(errorCode).toEqual(SelectorErrorCode.PlayerListContainsDuplicates);
        
     
    });


    it("Shall ensure that random player selection part is based on a random source.", () => {

        let amountOfPlayersToSelect: number = 3;
        when(mockRandomSource.getRandomNumber()).thenReturn(0); // random index removed is always 0 until only requested amount is left

        let [randomPlayerSelection, alternativePlayers] = selector.selectRandomPlayers(selectablePlayers, amountOfPlayersToSelect);
        expect(randomPlayerSelection.length).toEqual(amountOfPlayersToSelect);

        for (let i = 0, j = 0; i < selectablePlayers.length; i++){
            if (i < selectablePlayers.length - amountOfPlayersToSelect){
                expect(selectablePlayers.at(i)).toEqual(alternativePlayers.at(i));
            }else{
                expect(selectablePlayers.at(i)).toEqual(randomPlayerSelection.at(j));
                j++;
            }
        }
     
    });
   
 
  });