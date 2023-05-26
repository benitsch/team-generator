
import type Game from "@/models/Game";
import GameSkill from "@/models/GameSkill";
import Player from "@/models/Player";
import Team from "@/models/Team";
import {ContainerUtils} from "@/models/Utils";

export enum GeneratorErrorCode {
    TeamSizeAndPlayerLengthMismatch = 1,
    PlayerSkillsIncomplete,
  }

export default class TeamGenerator {

    /**
     * Generates a set of randomly assembled but balanced teams out of a set of given players and specified team size for a given game.
     * The amount of teams returned depends on the amount of players and team size: (players.length / teamSize) + 1 if(players.length % teamSize)
     * 
     * E.g.
     * Player skills: [5, 9, 4, 7, 10, 4, 3, 6, 4]
     * Team size: 3
     * 
     * First players are sorted by skill:
     * 
     *  [10, 9, 7, 6, 5, 4, 4, 4, 3] (the players with skill 4 are shuffled to introduce a bit of randomness)
     * 
     * Amount of Teams created: 3
     * 
     * Teams are initiated:
     * 
     * team1 []
     * team2 []
     * team3 []
     * 
     * First player assignment iteration:
     * 
     * team1 [10,]
     * team2 [9,]
     * team3 [7,]
     * 
     * Second player assignment iteration:
     * 
     * team1 [10,4]
     * team2 [9,5]
     * team3 [7,6]
     * 
     * Second player assignment iteration:
     * 
     * team1 [10,4,4] --> team skill = 18
     * team2 [9,5,4]  --> team skill = 18
     * team3 [7,6,4]  --> team skill = 17
     * 
     * In some cases this already suffices for optimum balance between teams.
     * To ensure optimization on higher team skill differences there will be a refinement step at the end.
     * This refinement sorts teams by their teams skill and tries to swap team member between best and worst team to reach optimum:
     * 
     * Let N be the amount of teams and T the team size.
     * 
     * Sort teams by their skill.
     * 
     * Repeat optimization step N^2 * (T-1) times or until no further optimization can be achieved.
     * 
     *  --> Compare best and worst team and if there's a skill diff then swap the best possible player pair (choose random if several options).
     * 
     *  --> Sort teams again if optimization could be achieved for current team pair
     * 
     * 
     * 
     * 
     * @param players The players to create the teams from (players.length must be >= 2* teamSize)
     * @param teamSize  The target size of the teams (if not a multiple of players.length then some teams might not be full, at most (teamSize - 1) teams)
     * @param game The game on which the balancing will be based (all players must be assessed with a skill >= 0 for this game)
     * @returns A set of randomly assembled but balanced teams.
     */
    public static generate(players: Array<Player>, teamSize: number ,game: Game): Array<Team> | GeneratorErrorCode{

        //Step 1: do proper param check
            
        //--> at least 2 full teams need to be createable: players.length >= 2* teamSize
        if(players.length < 2 * teamSize){
            return GeneratorErrorCode.TeamSizeAndPlayerLengthMismatch;
        }
        //--> each player must have a valid assessment for the given game
        for (const player of players){
            if(!player.isSkillAssessedForGame(game)){
                return GeneratorErrorCode.PlayerSkillsIncomplete;
            }
        }

        //Step 2: order players by their skill ascending and shuffle players with same skill in array
        // group players with same skill
        let playerSkillMapping: Map<number, Array<Player>> = 
            ContainerUtils.groupElementsByProperty<number>(players, (player: Player)=>(player.getSkillForGame(game)));

        // order groups ascending
        let orderedPlayerGroupMap = ContainerUtils.sortMapDescendingByKey<Array<Player>>(playerSkillMapping);

        // concatenate groups but shuffle within groups (same skill) beforehand to randomize a bit
        let orderedPlayerArray: Array<Player> = new Array<Player>();
        for(const playerOfSameSkillArray of orderedPlayerGroupMap.values()){
            ContainerUtils.shuffleArray(playerOfSameSkillArray);
            orderedPlayerArray = orderedPlayerArray.concat(playerOfSameSkillArray);
        }

        
        //Step 3: calculate the amount of teams creatable out of the player list and create them(players.length % teamSize may be > 0)
        // amount of teams that can be filled up with players
        const amountOfFullTeams: number = Math.floor(orderedPlayerArray.length / teamSize);
        let teamArray: Array<Team> = new Array<Team>();
        for (let i = 1; i <= amountOfFullTeams; i++){
            teamArray.push(new Team("Team" + i, teamSize));
        }

        const amountOfRemainingPlayers = orderedPlayerArray.length % teamSize;
        let additionalTeam: Team =  new Team("Team" + amountOfFullTeams + 1, teamSize); // will not be used if no remaining players


        //Step 4: Alternate between forward and backward looping over teams and add one player at a time(from high to low skill)
        let teamIndex: number = 0;
        let forward: boolean = true;
        let playerSkillSum: number = 0;
        for (const player of orderedPlayerArray){

            playerSkillSum += player.getSkillForGame(game);

            if(forward){ //alternating after each team has an additional player assigned

                if (teamIndex < teamArray.length){
                    teamArray.at(teamIndex)?.addPlayer(player);
                    teamIndex++;
                }else{
                    // additional team gets last in forward iteration if limit allows
                    if (additionalTeam.currentSize < amountOfRemainingPlayers){
                        additionalTeam.addPlayer(player);
                    }
                    forward = false; // switch to bachwards now
                }
                
            }else{ // backwards

                if(teamIndex >= teamArray.length){
                    teamIndex = teamArray.length - 1;
                    // additional team gets first in backward iteration if limit allows
                    if(additionalTeam.currentSize < amountOfRemainingPlayers){
                        additionalTeam.addPlayer(player);
                    }
                }else if(teamIndex >= 0){
                    teamArray.at(teamIndex)?.addPlayer(player);
                    teamIndex--;
                }else{
                    teamIndex = 0;
                    forward = true; // switch to forward again
                }
            }
        }



        //Step 5: Refine team balance (swap players between best and worst team if possible)

        // fill up additional team with fake substitution player of avg skill for refinement step, remove afterwards
        if (additionalTeam.fixedPlayers.length > 0){
            const avgPlayerSkill: number = Math.round(playerSkillSum / orderedPlayerArray.length);
            for(let i = additionalTeam.currentSize; i < additionalTeam.targetSize; i++){
                let player: Player = new Player("FakeSubPlayer" + i);
                player.addGameSkill(new GameSkill(game, avgPlayerSkill));
            }
            
            teamArray.push(additionalTeam); // add team with sub players to collection for balance optimizations
        }


        // optimize team balance as long as successful but at most until all swap options are exhausted
        const teamAscendingComparer = (team1: Team, team2: Team) => {return team1.getSkillForGame(game) - team2.getSkillForGame(game);};
        let maxSwapsLeft: number = teamArray.length * teamArray.length * (teamSize - 1); // (team size - 1) swaps per team pair.
        let lastSwapSuccessful:boolean = true;

        while(lastSwapSuccessful && maxSwapsLeft > 0){
            teamArray.sort(teamAscendingComparer);
            // always try to swap one player between best and worst team:
            lastSwapSuccessful = this.trySwapPlayerForBetterBalance(teamArray[0], teamArray[teamArray.length - 1], game);
            maxSwapsLeft--;
        }

        // remove fake sub players again from additional team:
        additionalTeam.clearSubstitutionPlayers();

        return teamArray;
    }

    /**
     * This function is a protected subroutine call which takes 2 full teams and 1 game as input
     * and tries to swap 1 player pair if applicable to decrease the skill diff of the given teams
     * as much as possible. If several options with the same result are available then a random
     * pair out of the options is chosen.
     * 
     * NOTE!: this function does no param check as it is only a subroutine and expects the given teams
     * to be full and the game skill is given for all players for the passed game and that each team
     * has at least 1 fixed player. Swapping will only be done with fixed players, not substitution players.
     * 
     * @param team1 The first team to be balanced.
     * @param team2 The second team to be balanced with.
     * @param game The game on which the skills between the teams will be compared for possible swaps.
     * @returns true if one pair of players could be swapped to decrease the skill diff, false otherwise.
     */
    protected static trySwapPlayerForBetterBalance(team1: Team, team2: Team, game: Game): boolean{

        //Step 1: Calc skill diff for given game
        let teamSkill1: number = team1.getSkillForGame(game);
        let teamSkill2: number = team2.getSkillForGame(game);
        let teamSkillDiff: number = Math.abs(teamSkill1 - teamSkill2);

        if (teamSkillDiff <= 1) { // no better balance possible as only 1 skill point can be shifted at most
            return false; 
        }

        //Step 2: check which team is better in given game
        let higherTeam: Team = teamSkill1 > teamSkill2? team1 : team2;
        let lowerTeam: Team = teamSkill1 < teamSkill2? team1 : team2;


        //Step 3: Fetch best possible swap pairs if any, which result lower diff
        let optimumSkillShift: number = teamSkillDiff/2;
        let potentialSwapPairs: Array<[Player, Player]> = new Array<[Player, Player]>();

        let bestDistanceToOptimum = optimumSkillShift; //full distance to optimum
        for(const playerTeamHigh of higherTeam.fixedPlayers){
            for(const playerTeamLow of lowerTeam.fixedPlayers){

                let skillGainLowerTeam: number = playerTeamHigh.getSkillForGame(game) - playerTeamLow.getSkillForGame(game);

                if (skillGainLowerTeam <= 0 || skillGainLowerTeam >= teamSkillDiff) { 
                    continue;  // skip option if team skill difference would be increased
                }

                let distanceToOptimum: number = Math.abs(optimumSkillShift - skillGainLowerTeam);
                if (distanceToOptimum > bestDistanceToOptimum){
                    continue; // skip if there are already better options
                }
                if (distanceToOptimum < bestDistanceToOptimum){
                    bestDistanceToOptimum = distanceToOptimum; // new optimum found
                    potentialSwapPairs.splice(0); // clear previous options
                }
                potentialSwapPairs.push([playerTeamHigh, playerTeamLow]); // add swap option

            }
        }

        //Step 4: If any swap possibilities, pick one randomly and return true, if not return false
        if (potentialSwapPairs.length > 0){
            let randomIndex: number = Math.floor(Math.random() * (potentialSwapPairs.length - 1));
            let [swapPlayerHigh, swapPlayerLow] = potentialSwapPairs[randomIndex];
            higherTeam.removePlayer(swapPlayerHigh);
            lowerTeam.removePlayer(swapPlayerLow);
            higherTeam.addPlayer(swapPlayerLow);
            lowerTeam.addPlayer(swapPlayerHigh);
            return true;
        }else{
            return false;
        }

    }

}