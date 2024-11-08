import type Game from '@/models/Game';
import Player from '@/models/Player';
import Team from '@/models/Team';
import ContainerUtils from '@/models/ContainerUtils';
import RandomSource from '@/models/RandomSource';
import DefaultRandomSource from '@/models/RandomSource';

/** This error code is used to determine different invalid input constellations */
export enum GeneratorErrorCode {
  TeamSizeAndPlayerLengthMismatch = 1,
  PlayerSkillsIncomplete,
  PlayerListContainsDuplicates,
}

/**
 * Team generator interface.
 */
export interface TeamGenerator {
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
  generate(
    players: Array<Player>,
    teamSize: number,
    game: Game,
  ): Array<Team> | GeneratorErrorCode;
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
  constructor(private randomSource: RandomSource = new DefaultRandomSource()) {}

  /**
   * Generates a set of randomly assembled but balanced teams out of a set of given players and specified team size for a given game.
   * The amount of teams returned depends on the amount of players and team size: (players.length / teamSize) + 1 if(players.length % teamSize)
   * Thr returned array of teams will be shuffled so it can be used to already setup matches between teams.
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
   * In some cases this already suffices for optimum balance between teams and might increase the performance of the next optimization step
   * as the teams are already pre-balanced. Alternatively teams can also have players randomly assigned and then optimized.
   * To ensure optimization on higher team skill differences there will be a refinement step at the end.
   * This refinement sorts teams by their teams skill and tries to swap team member between best and worst team to reach optimum:
   *
   * Let N be the amount of teams and T the team size.
   *
   * Sort teams by their skill.
   *
   * Repeat optimization step N^2 * T^2 times or until no further optimization can be achieved.
   *
   *  --> Compare best and worst team and if there's a skill diff then swap the best possible player pair (choose random if several options).
   *
   *  --> Sort teams again if optimization could be achieved for current team pair
   *
   *
   *
   * @param players The players to create the teams from (players.length must be >= 2* teamSize)
   * @param teamSize  The target size of the teams (if not a multiple of players.length then some teams might not be full, at most (teamSize - 1) teams)
   * @param game The game on which the balancing will be based (all players must be assessed with a skill >= 0 for this game)
   * @returns A set of randomly assembled but balanced teams (where one team might not be full depending on the amount of given players and team size).
   */
  public generate(
    players: Array<Player>,
    teamSize: number,
    game: Game,
  ): Array<Team> | GeneratorErrorCode {
    //Step 1: do proper param check
    const paramCheckResult: GeneratorErrorCode | undefined =
      this.validateGeneratorInput(players, teamSize, game);
    if (paramCheckResult !== undefined) {
      return paramCheckResult;
    }

    //Step 2: create X full teams and one additional team with remaining players if any
    const [fullTeams, additionalTeam] = this.assignPlayersToTeamsBalanced(
      players,
      teamSize,
      game,
    );

    //Step 3: Refine team balance (swap players between best and worst team if possible)
    // fill up additional team with fake substitution player of avg skill for refinement step, remove afterwards
    // add additional team only if it holds remaining fixed players.
    this.optimizeTeamSkillBalance(fullTeams);

    //Step 4: Add additional team if it holds any players (this is the team that would need additional players to fill up)
    if (additionalTeam.fixedPlayers.length > 0) {
      fullTeams.push(additionalTeam);
    }

    //Step 5: Shuffle order of teams (useful for opponent setup: 1. vs 2., 3. vs 4., ....)
    ContainerUtils.shuffleArray(fullTeams);
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
  protected validateGeneratorInput(
    players: Array<Player>,
    teamSize: number,
    game: Game,
  ): GeneratorErrorCode | undefined {
    //--> playerlist must not contain duplicates
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        if (players.at(i) === players.at(j)) {
          // TODO(tg): only reference check, deep comparison necessary?
          return GeneratorErrorCode.PlayerListContainsDuplicates;
        }
      }
    }
    //--> at least 2 full teams need to be createable: players.length >= 2* teamSize
    if (players.length < 2 * teamSize) {
      return GeneratorErrorCode.TeamSizeAndPlayerLengthMismatch;
    }
    //--> each player must have a valid assessment for the given game
    for (const player of players) {
      if (!player.isSkillAssessedForGame(game)) {
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
  protected orderPlayersDescendingByGameSkill(
    players: Array<Player>,
    game: Game,
  ): Array<Player> {
    // map players in groups by their game skill
    const playerSkillMapping: Map<
      number,
      Array<Player>
    > = ContainerUtils.groupElementsByProperty<number>(
      players,
      (player: Player) => player.getSkillForGame(game),
    );

    // order groups descending
    ContainerUtils.sortMapDescendingByKey(playerSkillMapping);

    // concatenate groups but shuffle within groups (same skill) beforehand to randomize a bit
    let orderedPlayerArray: Array<Player> = new Array<Player>();
    for (const playerOfSameSkillArray of playerSkillMapping.values()) {
      ContainerUtils.shuffleArray(playerOfSameSkillArray);
      orderedPlayerArray = orderedPlayerArray.concat(playerOfSameSkillArray);
    }
    return orderedPlayerArray;
  }

  /**
   * This function takes a list of players, the requested team size and the game for which the players shall be 
   * teamed up. The result consists of 2 elements:
   * 1) An array of teams which are filled up to the requested team size
   * 2) An extra team if player.length % team size != 0. This team contains the remaining players and is not full.
   *    But this extra team was also involved in balancing so it does not containt best or worst players only.
   *
   * The given player list will first be ordered by their skill in descending order. Balancing is achieved by 
   * assigning one player after another of the ordered player list to the teams alternating between first and last 
   * team to start with in each iteration.
   *
   *
   * @param playerArray The player list to assign to teams.
   * @param teamSize The size of the teams to be created
   * @param game The game on which the teams are created for.
   * @returns A tuple containing the created full teams and an additional team holding the remaining players if any
   */
  protected assignPlayersToTeamsBalanced(playerArray: Array<Player>,
    teamSize: number,
    game: Game,
  ): [Team[], Team] {
    const orderedPlayerArray: Array<Player> =
      this.orderPlayersDescendingByGameSkill(playerArray, game);

    return this.assignPlayersToTeams(orderedPlayerArray, teamSize, game);
  }

    /**
   * This function takes a list of players, the requested team size and the game for which the players shall be 
   * teamed up. The result consists of 2 elements:
   * 1) An array of teams which are filled up to the requested team size
   * 2) An extra team if player.length % team size != 0. This team contains the remaining players and is not full.
   *    But this extra team was also involved in balancing so it does not containt best or worst players only.
   *
   * The given player list will first be randomly shuffeled. Then players are added to teams alternating between first 
   * and last team to start with in each iteration.
   *
   *
   * @param playerArray The player list to assign to teams.
   * @param teamSize The size of the teams to be created
   * @param game The game on which the teams are created for.
   * @returns A tuple containing the created full teams and an additional team holding the remaining players if any
   */
    protected assignPlayersToTeamsRandom(playerArray: Array<Player>,
      teamSize: number,
      game: Game,
    ): [Team[], Team] {
      ContainerUtils.shuffleArray(playerArray);
      return this.assignPlayersToTeams(playerArray, teamSize, game);
    }


  /**
   * This function takes a list of players, team size and game to create teams by adding players to teams alternating between 
   * first and last team to start with in each iteration. (This is a precondition for pre-balancing). If the give player list is
   * already ordered by skill then this assignment method will allow for pre-balanced teams as output.
   * 
   * @param playerArray The player list to assign to teams.
   * @param teamSize The size of the teams to be created.
   * @param game The game which the teams are created for.
   * @returns A tuple containing the created full teams and an additional team holding the remaining players if any
   */
  protected assignPlayersToTeams(
    playerArray: Array<Player>,
    teamSize: number,
    game: Game,
  ): [Team[], Team] {
    // Create amount teams that can be fully filled
    const amountOfFullTeams: number = Math.floor(
      playerArray.length / teamSize,
    );
    const fullTeams: Array<Team> = new Array<Team>();
    for (let i = 1; i <= amountOfFullTeams; i++) {
      fullTeams.push(new Team('Team' + i, teamSize, game));
    }

    // Create additional team for potential remaining players
    const amountOfRemainingPlayers = playerArray.length % teamSize;
    const additionalTeam: Team = new Team(
      'Team' + (amountOfFullTeams + 1),
      teamSize,
      game,
    ); // stays empty if no remaining players

    // Alternate between forward and backward looping over teams and add one player of ordered list at a time
    let teamIndex: number = 0;
    let forward: boolean = true;
    for (const player of playerArray) {
      let additionalTeamHandled: boolean =
        additionalTeam.currentSize === amountOfRemainingPlayers;

      if (forward) {
        //alternating after each team has an additional player assigned

        // teams that need to get full get first in forward iteration
        if (teamIndex < fullTeams.length) {
          fullTeams.at(teamIndex)?.addPlayer(player);
          teamIndex++;
        } else {
          // additional team gets last in forward iteration if limit allows
          additionalTeam.addPlayer(player);
          additionalTeamHandled = true;
        }

        // check if to be swapped to backward assignment mode
        if (teamIndex === fullTeams.length && additionalTeamHandled) {
          forward = false; // switch to backwards now
        }
      } else {
        // backwards

        // additional team gets first in backward iteration if limit allows
        if (teamIndex === fullTeams.length && !additionalTeamHandled) {
          additionalTeam.addPlayer(player);
        } else {
          // other teams get after additional team in backwards iteration
          if (teamIndex >= fullTeams.length) {
            teamIndex = fullTeams.length - 1;
          }
          fullTeams.at(teamIndex)?.addPlayer(player);
          teamIndex--;
        }

        // swap back to forward assignment when back first team
        if (teamIndex < 0) {
          teamIndex = 0;
          forward = true; // switch to forward again
        }
      }
    }

    return [fullTeams, additionalTeam];
  }

  /**
   * This function takes a list of teams and optimizes the balancing between them.
   * This is done by iteratively try to swap 1 optimum player pair between any team combination
   * until there's no more improvment possible.
   *
   * The single player swap is based on a greedy approach (local optimum) but since
   * only one optimum player is swapped and not the whole team composition between
   * any two teams this aims for a more global optimum. Especially since now any team
   * combination is compared instead of best and worst.
   *
   * Again this function assumes validation has been done to assure that all players
   * within the team have their game skill assessed for the given game!!!!
   *
   * @param teams The teams for which to optimize their balance
   */
  protected optimizeTeamSkillBalance(teams: Array<Team>): void {
    if (teams.length < 2){
      return;
    }

    let lastSwapSuccessful: boolean = true;

    // optimize team balance as long as successful. Will eventually stop as no swapping improvement possible anymore.
    while (lastSwapSuccessful) {

      lastSwapSuccessful = false; // safeguard to terminate while loop.
      for (let teamA of teams){
        for (let teamB of teams){
          if (teamA !== teamB){// try to swap one player between two different teams
            lastSwapSuccessful = this.trySwapPlayerForBetterBalance(
              teamA,
              teamB,
            );
          }
          if (lastSwapSuccessful){break;} // break for outer while loop on success. 
          // if not breaking then possible optimization could be overseen when exiting for loops with last attempt == false.
        }
        if (lastSwapSuccessful){break;} // break for outer while loop on success.
      }
    }
  }

  protected filterBySkill(teams: Array<Team>, skill: number): Array<Team> {


    return teams;
  }

  /**
   * This function is a protected subroutine call which takes 2 full teams for a certain game as input
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
  protected trySwapPlayerForBetterBalance(team1: Team, team2: Team): boolean {
    //Step 1: Calc skill diff for given game
    const game: Game = team1.game;
    const teamSkill1: number = team1.getTeamGameSkill();
    const teamSkill2: number = team2.getTeamGameSkill();
    const teamSkillDiff: number = Math.abs(teamSkill1 - teamSkill2);

    if (teamSkillDiff <= 1) {
      // no better balance possible as only 1 skill point can be shifted at most
      return false;
    }

    //Step 2: Check which team is better in given game
    const higherTeam: Team = teamSkill1 > teamSkill2 ? team1 : team2;
    const lowerTeam: Team = teamSkill1 < teamSkill2 ? team1 : team2;

    //Step 3: Fetch best possible swap pairs if any, which result lower diff
    const optimumSkillShift: number = teamSkillDiff / 2;
    const potentialSwapPairs: Array<[Player, Player]> = new Array<
      [Player, Player]
    >();

    let bestDistanceToOptimum = optimumSkillShift; //full distance to optimum
    for (const playerTeamHigh of higherTeam.fixedPlayers) {
      for (const playerTeamLow of lowerTeam.fixedPlayers) {
        const skillGainLowerTeam: number =
          playerTeamHigh.getSkillForGame(game) -
          playerTeamLow.getSkillForGame(game);

        if (skillGainLowerTeam <= 0 || skillGainLowerTeam >= teamSkillDiff) {
          continue; // skip option if team skill difference would be increased
        }

        const distanceToOptimum: number = Math.abs(
          optimumSkillShift - skillGainLowerTeam,
        );
        if (distanceToOptimum > bestDistanceToOptimum) {
          continue; // skip if there are already better options or swap does not optimize teams
        }
        if (distanceToOptimum < bestDistanceToOptimum) {
          bestDistanceToOptimum = distanceToOptimum; // new optimum found
          potentialSwapPairs.splice(0); // clear previous options
        }
        potentialSwapPairs.push([playerTeamHigh, playerTeamLow]); // add swap option
      }
    }

    //Step 4: If any swap possibilities, pick one randomly and return true, if not return false
    if (potentialSwapPairs.length > 0) {
      const randomIndex: number = Math.floor(
        this.randomSource.getRandomNumber() * (potentialSwapPairs.length - 1),
      );
      const [swapPlayerHigh, swapPlayerLow] = potentialSwapPairs[randomIndex];
      higherTeam.removePlayer(swapPlayerHigh);
      lowerTeam.removePlayer(swapPlayerLow);
      higherTeam.addPlayer(swapPlayerLow);
      lowerTeam.addPlayer(swapPlayerHigh);
      return true;
    } else {
      return false;
    }
  }
}
