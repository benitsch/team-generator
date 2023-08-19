import { describe, it, expect } from "vitest";
import { imock, instance } from "@johanblumenberg/ts-mockito";

import Team from "../Team";
import Player from "../Player";
import GameSkill from "../GameSkill";
import Game from "../Game";
import TeamGenerator from "../TeamGenerator";
import BalancedRandomTeamGenerator from "../TeamGenerator";
import { GeneratorErrorCode } from "../TeamGenerator";
import RandomSource from "../RandomSource";
import DefaultRandomSource from "../RandomSource";


class BalancedRandomTeamGeneratorUnderTest extends BalancedRandomTeamGenerator {
    constructor(randomSource: RandomSource = new DefaultRandomSource()){
        super(randomSource);
    }

    public validateGeneratorInput(players: Player[], teamSize: number, game: Game): GeneratorErrorCode | undefined {
        return super.validateGeneratorInput(players, teamSize, game);
    }

    public orderPlayersDescendingByGameSkill(players: Player[], game: Game): Player[] {
        return super.orderPlayersDescendingByGameSkill(players, game);
    }

    public assignPlayersToTeams(orderedPlayerArray: Player[], teamSize: number, game: Game): [Team[], Team, number] {
        return super.assignPlayersToTeams(orderedPlayerArray, teamSize, game);
    }

    public optimizeTeamSkillBalance(teams: Team[]): void {
        return super.optimizeTeamSkillBalance(teams);
    }

    public trySwapPlayerForBetterBalance(team1: Team, team2: Team): boolean {
        return super.trySwapPlayerForBetterBalance(team1, team2);
    }
}

describe("BalancedRandomTeamGeneratorInterfaceTest", () => {

    const game: Game = new Game("HOTS", "MOBA");
    let generator: TeamGenerator = new BalancedRandomTeamGenerator();


    it("Shall generate the expected amount of full teams.", () => {

        const teamSize: number = 3;
        const amountOfPlayers = 9;
    
        let players: Array<Player> = new Array<Player>();
    
        for(let i = 0; i < amountOfPlayers; i++){
            let player: Player = new Player("Player"+i);
            player.addGameSkill(new GameSkill(game, i%5 + 1));
            players.push(player);
        }

        const generateResult: Array<Team> | GeneratorErrorCode = generator.generate(players, teamSize, game);
        expect(generateResult).instanceOf(Array<Team>);

        const teams: Array<Team> = generateResult as Array<Team>;

        expect(teams.length).toEqual(3);

        for (let team of teams){
            expect(team.targetSize).toEqual(teamSize);
            expect(team.isFull).toBe(true);
        }
     
    });

    it("Shall generate the expected amount teams with one team that is missing 1 player.", () => {

        const teamSize: number = 3;
        const amountOfPlayers = 8; // one team will have only 2 players
    
        let players: Array<Player> = new Array<Player>();
    
        for(let i = 0; i < amountOfPlayers; i++){
            let player: Player = new Player("Player"+i);
            player.addGameSkill(new GameSkill(game, i%5 + 1));
            players.push(player);
        }

        const generateResult: Array<Team> | GeneratorErrorCode = generator.generate(players, teamSize, game);
        expect(generateResult).instanceOf(Array<Team>);

        const teams: Array<Team> = generateResult as Array<Team>;

        expect(teams.length).toEqual(3);

        let teamsNotFull: number = 0;
        for (let team of teams){
            expect(team.targetSize).toEqual(teamSize);
            if(!team.isFull){
                expect(team.currentSize).toEqual(team.targetSize - 1);
                teamsNotFull++;
            }
        }

        expect(teamsNotFull).toEqual(1);
     
    });

    it("Shall generate the expected amount teams with one team that has only one player.", () => {

        const teamSize: number = 3;
        const amountOfPlayers = 7; // one team will have only 1 player
    
        let players: Array<Player> = new Array<Player>();
    
        for(let i = 0; i < amountOfPlayers; i++){
            let player: Player = new Player("Player"+i);
            player.addGameSkill(new GameSkill(game, i%5 + 1));
            players.push(player);
        }

        const generateResult: Array<Team> | GeneratorErrorCode = generator.generate(players, teamSize, game);
        expect(generateResult).instanceOf(Array<Team>);

        const teams: Array<Team> = generateResult as Array<Team>;

        expect(teams.length).toEqual(3);

        let teamsNotFull: number = 0;
        for (let team of teams){
            expect(team.targetSize).toEqual(teamSize);
            if(!team.isFull){
                expect(team.currentSize).toEqual(1);
                teamsNotFull++;
            }
        }

        expect(teamsNotFull).toEqual(1);
     
    });

   
 
  });

  describe("BalancedRandomTeamGeneratorClassTest", () => {

    const game: Game = new Game("HOTS", "MOBA");
    const mockRandomSource: RandomSource = imock();
    const generator: BalancedRandomTeamGeneratorUnderTest = new BalancedRandomTeamGeneratorUnderTest(instance(mockRandomSource));


    it("Shall not accept duplicate players at input validation.", () => {

        const teamSize: number = 3;
        const amountOfPlayers = 9;
    
        let players: Array<Player> = new Array<Player>();
        let player: Player = new Player("PlayerOne");
        player.addGameSkill(new GameSkill(game, 3));
    
        for(let i = 0; i < amountOfPlayers; i++){
            players.push(player);
        }

        const generateResult: GeneratorErrorCode | undefined= generator.validateGeneratorInput(players, teamSize, game);
        expect(generateResult).toBeTypeOf("number");
        
        const errorCode: GeneratorErrorCode = generateResult as GeneratorErrorCode;
        expect(errorCode).toEqual(GeneratorErrorCode.PlayerListContainsDuplicates);
     
    });

    it("Shall not accept too few players at input validation (at least two teams must be creatable!).", () => {

        const teamSize: number = 3;
        const amountOfPlayers = 5;
    
        let players: Array<Player> = new Array<Player>();
    
        for(let i = 0; i < amountOfPlayers; i++){
            let player: Player = new Player("Player" + i);
            player.addGameSkill(new GameSkill(game, 3));
            players.push(player);
        }

        const generateResult: GeneratorErrorCode | undefined = generator.validateGeneratorInput(players, teamSize, game);
        expect(generateResult).toBeTypeOf("number");
        
        const errorCode: GeneratorErrorCode = generateResult as GeneratorErrorCode;
        expect(errorCode).toEqual(GeneratorErrorCode.TeamSizeAndPlayerLengthMismatch);
     
    });

    it("Shall not accept players with no game assessment at input validation.", () => {

        const teamSize: number = 3;
        const amountOfPlayers = 8;
    
        let players: Array<Player> = new Array<Player>();
    
        for(let i = 0; i < amountOfPlayers; i++){
            let player: Player = new Player("Player" + i);
            player.addGameSkill(new GameSkill(game, 3));
            players.push(player);
        }

        players.push(new Player("NoSkill"));

        const generateResult: GeneratorErrorCode | undefined = generator.validateGeneratorInput(players, teamSize, game);
        expect(generateResult).toBeTypeOf("number");
        
        const errorCode: GeneratorErrorCode = generateResult as GeneratorErrorCode;
        expect(errorCode).toEqual(GeneratorErrorCode.PlayerSkillsIncomplete);
     
    });

    it("Shall accept valid input players enough to build at least two teams.", () => {

        const teamSize: number = 3;
        const amountOfPlayers = 6;
    
        let players: Array<Player> = new Array<Player>();
    
        for(let i = 0; i < amountOfPlayers; i++){
            let player: Player = new Player("Player" + i);
            player.addGameSkill(new GameSkill(game, 3));
            players.push(player);
        }

        const generateResult: GeneratorErrorCode | undefined = generator.validateGeneratorInput(players, teamSize, game);
        expect(generateResult).toBeTypeOf("undefined"); //SUCCESS
        
     
    });
   
 
  });