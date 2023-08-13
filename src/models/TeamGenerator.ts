
import type Game from "@/models/Game";
import GameSkill from "@/models/GameSkill";
import Player from "@/models/Player";
import Team from "@/models/Team";
import ContainerUtils from "@/models/ContainerUtils";
import RandomSource from "@/models/RandomSource";
import DefaultRandomSource from "@/models/RandomSource";

/** This error code is used to determine different invalid input constellations */
export enum GeneratorErrorCode {
    TeamSizeAndPlayerLengthMismatch = 1,
    PlayerSkillsIncomplete,
    PlayerListContainsDuplicates,
  }

  /**
   * Team generator interface.
   */
export default interface TeamGenerator {
    /**
     * Generates teams from a set of given players for a specific game (all players need gameskill assessed)
     * and a given team size.
     * 
     * @param players The players to generate teams from.
     * @param teamSize The team size desired for the returned teams.
     * @param game The game the skill balancing shall be based on.
     * 
     * @returns a set of teams or an error code.
     */
    public generate(players: Array<Player>, teamSize: number, game: Game): Array<Team> | GeneratorErrorCode;
}

  /**
   * This team generator provides the functionality to create randomly assigned but balanced teams out of a given
   * set of players.
   * 
   * It has one public static interface "generate" separated into several protected substeps.
   */
export default class BalancedRandomTeamGenerator implements TeamGenerator {

    /**
     * Constructor that optionally takes a random source interface as argument.
     * DefaultRandomSource is the default interface implementaion taken.
     * 
     * @param randomSource The random source to be injected for random team generation.
     */
    constructor (private randomSource: RandomSource = new DefaultRandomSource()){}

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
    public generate(players: Array<Player>, teamSize: number, game: Game): Array<Team> | GeneratorErrorCode{

        //Step 1: do proper param check
        let paramCheckResult: GeneratorErrorCode | undefined = this.validateGeneratorInput(players, teamSize, game);
        if (paramCheckResult !== undefined){
            return paramCheckResult;
        }

        //Step 2: order players by their skill descending and shuffle players with same skill in array
        let orderedPlayerArray: Array<Player> = this.orderPlayersDescendingByGameSkill(players, game);

        
        //Step 3: create X full teams and one additional team with remaining players if any
        let [fullTeams, additionalTeam, avgPlayerSkill] = this.assignPlayersToTeams(orderedPlayerArray, teamSize, game);
        

        //Step 4: Refine team balance (swap players between best and worst team if possible)
        // fill up additional team with fake substitution player of avg skill for refinement step, remove afterwards
        if (additionalTeam.fixedPlayers.length > 0){
            for(let i = additionalTeam.currentSize; i < additionalTeam.targetSize; i++){
                let player: Player = new Player("FakeSubPlayer" + i);
                player.addGameSkill(new GameSkill(game, avgPlayerSkill));
            }
            fullTeams.push(additionalTeam); // add team with sub players to collection for balance optimizations
        }

        // optimize balance between teams
        this.optimizeTeamSkillBalance(fullTeams);

        // remove fake sub players again from additional team:
        additionalTeam.clearSubstitutionPlayers();

        return fullTeams;
    }

    /**
     * This function validates if the given players have an assessed skill for the given game
     * and if there are enough players to create teams for the requestd size. At least
     * 2 full teams must be creatable.
     * 
     * This validation shall be called prior to any other function call in the team generator!!!!
     * 
     * @param players The player list to be validated in length (at least 2 full teams)
     * @param teamSize The team size to validate the player length with
     * @param game The game which all players must have an assessed skill for
     * @returns Error code if validation fails, undefined otherwise.
     */
    protected validateGeneratorInput(players: Array<Player>, teamSize: number, game: Game): GeneratorErrorCode | undefined {
        //--> playerlist must not contain duplicates
        for(let i = 0; i < players.length; i++){
            for (let j = i + 1; j < players.length; j++){
                if (players.at(i) === players.at(j)){ // TODO(tg): only reference check, deep comparison necessary?
                    return GeneratorErrorCode.PlayerListContainsDuplicates;
                }
            }
        }
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
       return undefined;
    }


    /**
     * Orders players descending by ther game skill and shuffles positions between players with the same skill
     * in order to introduce some randomness in the results.
     * 
     * It is assumed that all players have a game skill assessed for the given game!!!
     * Validation must happen prior to calling this function!!!
     * 
     * @param players The player array to be ordered by their game skill
     * @param game The game for which the players shall be ordered
     * @returns A descending ordered list of players.
     */
    protected orderPlayersDescendingByGameSkill(players: Array<Player>, game: Game): Array<Player> {
        // map players in groups by their game skill
        let playerSkillMapping: Map<number, Array<Player>> = 
            ContainerUtils.groupElementsByProperty<number>(players, (player: Player)=>(player.getSkillForGame(game)));

        // order groups descending
        ContainerUtils.sortMapDescendingByKey<Array<Player>>(playerSkillMapping);

        // concatenate groups but shuffle within groups (same skill) beforehand to randomize a bit
        let orderedPlayerArray: Array<Player> = new Array<Player>();
        for(const playerOfSameSkillArray of playerSkillMapping.values()){
            ContainerUtils.shuffleArray(playerOfSameSkillArray);
            orderedPlayerArray = orderedPlayerArray.concat(playerOfSameSkillArray);
        }
        return orderedPlayerArray;
    }

    /**
     * This function takes a list of players (ideally ordered by their game skill for balance reasons), the 
     * requested team size and the game for which the players shall be teamed up. The result consists of 3
     * elements:
     * 1) An array of teams which are filled up to the requested team size
     * 2) An extra team if player.length % team size != 0. This team contains the remaining players and is not full.
     *    But this extra team was also involved in balancing so it does not containt best or worst players only.
     * 3) The average player skill for the given game.
     * 
     * If the given player list is not ordered by the players game skill this function will still return the
     * mentioned results but balancing is not guaranteed. Balancing is achieved by assigning one player after
     * another of the ordered player list to the teams alternating between first and last team to start with
     * in each iteration.
     * 
     * 
     * @param orderedPlayerArray The player list which is descending ordered by their game skill
     * @param teamSize The size of the teams to be created
     * @param game The game on which the ordering of the incoming player list is based on (needed to calc avg player skill)
     * @returns A tuple containing the created full teams, a non full team if players are left over and the avg player skill
     */
    protected assignPlayersToTeams(orderedPlayerArray: Array<Player>, teamSize: number, game:Game): [Array<Team>, Team, number] {

        // Create amount teams that can be fully filled
        const amountOfFullTeams: number = Math.floor(orderedPlayerArray.length / teamSize);
        let fullTeams: Array<Team> = new Array<Team>();
        for (let i = 1; i <= amountOfFullTeams; i++){
            fullTeams.push(new Team("Team" + i, teamSize, game));
        }

        // Create additional team for potential remaining players
        const amountOfRemainingPlayers = orderedPlayerArray.length % teamSize;
        let additionalTeam: Team =  new Team("Team" + (amountOfFullTeams + 1), teamSize, game); // stays empty if no remaining players

        // Alternate between forward and backward looping over teams and add one player of ordered list at a time
        let teamIndex: number = 0;
        let forward: boolean = true;
        let playerSkillSum: number = 0;
        for (const player of orderedPlayerArray){

            playerSkillSum += player.getSkillForGame(game);
            let additionalTeamHandled: boolean = additionalTeam.currentSize === amountOfRemainingPlayers;

            if(forward){ //alternating after each team has an additional player assigned

                // teams that need to get full get first in forward iteration
                if (teamIndex < fullTeams.length){
                    fullTeams.at(teamIndex)?.addPlayer(player);
                    teamIndex++;
                }else{ // additional team gets last in forward iteration if limit allows
                    additionalTeam.addPlayer(player);
                    additionalTeamHandled = true;
                }
                
                // check if to be swapped to backward assignment mode
                if(teamIndex === fullTeams.length && additionalTeamHandled){
                    forward = false; // switch to backwards now
                }
                
            }else{ // backwards

                // additional team gets first in backward iteration if limit allows
                if(teamIndex === fullTeams.length && !additionalTeamHandled){
                    additionalTeam.addPlayer(player);
                }else { // other teams get after additional team in backwards iteration
                    if(teamIndex >= fullTeams.length){
                        teamIndex = fullTeams.length - 1;
                    }
                    fullTeams.at(teamIndex)?.addPlayer(player);
                    teamIndex--;
                }

                // swap back to forward assignment when back first team 
                if(teamIndex < 0){
                    teamIndex = 0;
                    forward = true; // switch to forward again
                }
            }
        }

        const avgPlayerSkill: number = Math.round(playerSkillSum / orderedPlayerArray.length);
        return [fullTeams, additionalTeam, avgPlayerSkill];
    }

    /**
     * This function takes a list of teams and optimizes the balancing between them.
     * This is done by sorting the teams from best to worst and iteratively try to 
     * swap 1 optimum player pair of the best and worst team and reshuffle the team
     * array.
     * 
     * The single player swap is based on a greedy approach (local optimum) but since
     * only one optimum player is swapped and not the whole team composition between
     * best and worst team this optimization algorithm may aim for a global balance 
     * optimum over all teams (to be verified).
     * 
     * Again this function assumes validation has been done to assure that all players
     * within the team have their game skill assessed for the given game!!!!
     * 
     * @param teams The teams for which to optimize their balance
     */
    protected optimizeTeamSkillBalance(teams: Array<Team>): void{

        const teamAscendingComparer = (team1: Team, team2: Team) => {return team1.getTeamGameSkill() - team2.getTeamGameSkill();};

        let teamSize: number = teams[0].targetSize; // teams param must not be empty!!
        let maxSwapsLeft: number = teams.length * teams.length * (teamSize - 1); // (team size - 1) swaps per team pair.
        let lastSwapSuccessful:boolean = true;

        // optimize team balance as long as successful but at most until all swap options are exhausted
        while(lastSwapSuccessful && maxSwapsLeft > 0){
            teams.sort(teamAscendingComparer);
            // try to swap one player between best and worst team:
            lastSwapSuccessful = this.trySwapPlayerForBetterBalance(teams[0], teams[teams.length - 1]);
            maxSwapsLeft--;
        }
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
     * @returns true if one pair of players could be swapped to decrease the skill diff, false otherwise.
     */
    protected trySwapPlayerForBetterBalance(team1: Team, team2: Team): boolean{

        //Step 1: Calc skill diff for given game
        let game: Game = team1.game;
        let teamSkill1: number = team1.getTeamGameSkill();
        let teamSkill2: number = team2.getTeamGameSkill();
        let teamSkillDiff: number = Math.abs(teamSkill1 - teamSkill2);

        if (teamSkillDiff <= 1) { // no better balance possible as only 1 skill point can be shifted at most
            return false; 
        }

        //Step 2: Check which team is better in given game
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
                    continue; // skip if there are already better options or swap does not optimize teams
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
            let randomIndex: number = Math.floor(this.randomSource.getRandomNumber() * (potentialSwapPairs.length - 1));
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