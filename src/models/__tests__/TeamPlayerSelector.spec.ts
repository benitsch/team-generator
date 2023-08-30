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

    it("Shall not accept duplicates in selectable player list.", () => {

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

    it("Shall not accept that selectable player list contains team members.", () => {

        const minTeamSkill: number = 10;
        const maxTeamSkill: number = 20;

        let selectablePlayerListWithTeamMembers: Array<Player> = new Array<Player>();

        for (let i = 0; i < 10; i++){
            let player: Player = new Player("Player" + i);
            player.addGameSkill(new GameSkill(game, (i % 5) + 1));
            selectablePlayerListWithTeamMembers.push(player);
        }

        selectablePlayerListWithTeamMembers.push(lonePlayer); // this player is already on the team

    
        const validateResult: SelectorErrorCode | undefined = selector.validateSelectorInput(selectablePlayerListWithTeamMembers, team, minTeamSkill, maxTeamSkill);
        expect(validateResult).toBeTypeOf("number");

        const errorCode: SelectorErrorCode = validateResult as SelectorErrorCode;
        expect(errorCode).toEqual(SelectorErrorCode.PlayerListContainsTeamMembers);
        
     
    });

    it("Shall not accept too few selectable players.", () => {

        const minTeamSkill: number = 10;
        const maxTeamSkill: number = 20;

        let selectablePlayerListWithTeamMembers: Array<Player> = new Array<Player>();

        let player: Player = new Player("OneAdditionalPlayer"); // only one player selectable although more needed to fill team
        player.addGameSkill(new GameSkill(game, 3));
        selectablePlayerListWithTeamMembers.push(player);
    
        const validateResult: SelectorErrorCode | undefined = selector.validateSelectorInput(selectablePlayerListWithTeamMembers, team, minTeamSkill, maxTeamSkill);
        expect(validateResult).toBeTypeOf("number");

        const errorCode: SelectorErrorCode = validateResult as SelectorErrorCode;
        expect(errorCode).toEqual(SelectorErrorCode.NotEnoughPlayersProvided);
        
     
    });

    it("Shall not accept selectable players with missing game skill to join team.", () => {

        const minTeamSkill: number = 10;
        const maxTeamSkill: number = 20;

        let selectablePlayerListWithTeamMembers: Array<Player> = new Array<Player>();

        for (let i = 0; i < 10; i++){
            let player: Player = new Player("Player" + i);
            selectablePlayerListWithTeamMembers.push(player);
        }
    
        const validateResult: SelectorErrorCode | undefined = selector.validateSelectorInput(selectablePlayerListWithTeamMembers, team, minTeamSkill, maxTeamSkill);
        expect(validateResult).toBeTypeOf("number");

        const errorCode: SelectorErrorCode = validateResult as SelectorErrorCode;
        expect(errorCode).toEqual(SelectorErrorCode.PlayerSkillsIncomplete);
        
     
    });

    it("Shall accept selectable player input if all criteria is fulfilled.", () => {

        const minTeamSkill: number = 10;
        const maxTeamSkill: number = 20;

        let selectablePlayerListWithTeamMembers: Array<Player> = new Array<Player>();

        for (let i = 0; i < 10; i++){
            let player: Player = new Player("Player" + i);
            player.addGameSkill(new GameSkill(game, (i % 5) + 1));
            selectablePlayerListWithTeamMembers.push(player);
        }
    
        const validateResult: SelectorErrorCode | undefined = selector.validateSelectorInput(selectablePlayerListWithTeamMembers, team, minTeamSkill, maxTeamSkill);
        expect(validateResult).toBeTypeOf("undefined"); //success
     
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

    it("Shall not optimize player selection if current selection within given range.", () => {

        const minTeamSkill: number = 7;
        const maxTeamSkill: number = 9;

        let currentPlayerSelection: Array<Player> = new Array<Player>();
        let currentSelectedPlayer: Player = new Player("ChosenOne");
        currentSelectedPlayer.addGameSkill(new GameSkill(game, 3));
        currentPlayerSelection.push(currentSelectedPlayer);

        let alternativePlayerSelection: Array<Player> = new Array<Player>();
        let alternativePlayer: Player = new Player("AnotherInterestingChoice");
        alternativePlayer.addGameSkill(new GameSkill(game, 3));
        alternativePlayerSelection.push(alternativePlayer);

        let teamToSelectPlayersFor: Team = new Team("NotFullTeam", 2, game);
        let playerOnTeam: Player = new Player("FirstOne");
        playerOnTeam.addGameSkill(new GameSkill(game, 5));
        expect(teamToSelectPlayersFor.addPlayer(playerOnTeam)).toEqual(true);
    
        const optimizedSelection: Array<Player> = selector.optimizePlayerSelectionOutOfRange(currentPlayerSelection, alternativePlayerSelection, teamToSelectPlayersFor, minTeamSkill, maxTeamSkill);
        expect(optimizedSelection.length).toEqual(teamToSelectPlayersFor.targetSize - teamToSelectPlayersFor.currentSize);
        expect(optimizedSelection).toEqual(currentPlayerSelection); // no changes to current selection expected.
     
    });

    it("Shall select player from alternative if team skill exceeds max with current selection.", () => {

        const minTeamSkill: number = 7;
        const maxTeamSkill: number = 9;

        let currentPlayerSelection: Array<Player> = new Array<Player>();
        let currentSelectedPlayer: Player = new Player("ChosenOne");
        currentSelectedPlayer.addGameSkill(new GameSkill(game, 5)); // current selected puts team out of range
        currentPlayerSelection.push(currentSelectedPlayer);

        let alternativePlayerSelection: Array<Player> = new Array<Player>();
        let alternativePlayer: Player = new Player("AnotherInterestingChoice");
        alternativePlayer.addGameSkill(new GameSkill(game, 3));
        alternativePlayerSelection.push(alternativePlayer);

        let teamToSelectPlayersFor: Team = new Team("NotFullTeam", 2, game);
        let playerOnTeam: Player = new Player("FirstOne");
        playerOnTeam.addGameSkill(new GameSkill(game, 5));
        expect(teamToSelectPlayersFor.addPlayer(playerOnTeam)).toEqual(true);
    
        const optimizedSelection: Array<Player> = selector.optimizePlayerSelectionOutOfRange(currentPlayerSelection, alternativePlayerSelection, teamToSelectPlayersFor, minTeamSkill, maxTeamSkill);
        expect(optimizedSelection.length).toEqual(teamToSelectPlayersFor.targetSize - teamToSelectPlayersFor.currentSize);
        expect(optimizedSelection).toContain(alternativePlayer); // alternative player selected
     
    });

    it("Shall select player from alternative if team skill is below min with current selection.", () => {

        const minTeamSkill: number = 7;
        const maxTeamSkill: number = 9;

        let currentPlayerSelection: Array<Player> = new Array<Player>();
        let currentSelectedPlayer: Player = new Player("ChosenOne");
        currentSelectedPlayer.addGameSkill(new GameSkill(game, 1)); // current selected puts team out of range
        currentPlayerSelection.push(currentSelectedPlayer);

        let alternativePlayerSelection: Array<Player> = new Array<Player>();
        let alternativePlayer: Player = new Player("AnotherInterestingChoice");
        alternativePlayer.addGameSkill(new GameSkill(game, 3));
        alternativePlayerSelection.push(alternativePlayer);

        let teamToSelectPlayersFor: Team = new Team("NotFullTeam", 2, game);
        let playerOnTeam: Player = new Player("FirstOne");
        playerOnTeam.addGameSkill(new GameSkill(game, 5));
        expect(teamToSelectPlayersFor.addPlayer(playerOnTeam)).toEqual(true);
    
        const optimizedSelection: Array<Player> = selector.optimizePlayerSelectionOutOfRange(currentPlayerSelection, alternativePlayerSelection, teamToSelectPlayersFor, minTeamSkill, maxTeamSkill);
        expect(optimizedSelection.length).toEqual(teamToSelectPlayersFor.targetSize - teamToSelectPlayersFor.currentSize);
        expect(optimizedSelection).toContain(alternativePlayer); // alternative player selected
     
    });


    it("Shall select best possible player if within range not possible.", () => {

        const minTeamSkill: number = 7;
        const maxTeamSkill: number = 7;

        let currentPlayerSelection: Array<Player> = new Array<Player>();
        let currentSelectedPlayer: Player = new Player("ChosenOne");
        currentSelectedPlayer.addGameSkill(new GameSkill(game, 5)); // current selected puts team out of range
        currentPlayerSelection.push(currentSelectedPlayer);

        let alternativePlayerSelection: Array<Player> = new Array<Player>();
        let alternativePlayer1: Player = new Player("AlternativeChoice");
        alternativePlayer1.addGameSkill(new GameSkill(game, 4));
        alternativePlayerSelection.push(alternativePlayer1);
        let alternativePlayer2: Player = new Player("BetterAlternativeChoice");
        alternativePlayer2.addGameSkill(new GameSkill(game, 3));
        alternativePlayerSelection.push(alternativePlayer2);

        let teamToSelectPlayersFor: Team = new Team("NotFullTeam", 2, game);
        let playerOnTeam: Player = new Player("FirstOne");
        playerOnTeam.addGameSkill(new GameSkill(game, 5));
        expect(teamToSelectPlayersFor.addPlayer(playerOnTeam)).toEqual(true);
    
        const optimizedSelection: Array<Player> = selector.optimizePlayerSelectionOutOfRange(currentPlayerSelection, alternativePlayerSelection, teamToSelectPlayersFor, minTeamSkill, maxTeamSkill);
        expect(optimizedSelection.length).toEqual(teamToSelectPlayersFor.targetSize - teamToSelectPlayersFor.currentSize);
        expect(optimizedSelection).toContain(alternativePlayer2); // best alternative selected although team not in skill range.
     
    });
   
 
  });