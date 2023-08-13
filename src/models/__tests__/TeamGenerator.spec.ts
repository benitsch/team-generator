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


    it("Shall generate the expected amount of full teams.", () => {

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
        console.log(teams);
        for(const team of teams){
            console.log(team.currentSize);
            console.log(team.targetSize);
            console.log(team.isFull);
        }

        expect(teams.length).toEqual(3);

        for (let team of teams){
            expect(team.targetSize).toEqual(teamSize);
            expect(team.isFull).toBe(true);
        }
     
    });

    it("Shall generate the expected amount of teams with one team filled partially.", () => {

        const teamSize: number = 3;
        const amountOfPlayers = 8;
    
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
            expect(team.targetSize).toEqual(teamSize);
            expect(team.isFull).toBe(true);
        }
     
    });
   
 
  });

  describe("BalancedRandomTeamGeneratorClassTest", () => {

    const game: Game = new Game("HOTS", "MOBA");
    const mockRandomSource: RandomSource = imock();
    const generator: BalancedRandomTeamGeneratorUnderTest = new BalancedRandomTeamGeneratorUnderTest(instance(mockRandomSource));


    it("Shall generate the expected amount of teams of expected target size.", () => {

        //TODO(tg): add tests for subroutines of generator
        expect(true).toEqual(true);
     
    });
   
 
  });