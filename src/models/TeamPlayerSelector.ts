import Player from '@/models/Player';
import Team from '@/models/Team';
import type RandomSource from '@/models/RandomSource';
import DefaultRandomSource from '@/models/RandomSource';

/** This error code is used to determine different invalid input constellations */
export enum SelectorErrorCode {
  NotEnoughPlayersProvided = 1,
  PlayerSkillsIncomplete,
  TeamAlreadyFull,
  PlayerListContainsTeamMembers,
  PlayerListContainsDuplicates,
  MinTeamSkillExceedsMax,
  TeamSkillRangeNegative,
}

/**
 * Team player selector interface.
 */
export interface TeamPlayerSelector {
  /**
   * Selects players to fill up a team for a specific game within a given skill range.
   * At least the missing amount of players in the team must be covered with the given player selection
   * and all players must be skill assessed for the team's game. The function will return a selection of
   * players which aim to keep the team's skill between a given min and max. If this cannot be achieved
   * the function shall return a player selection as close as possible to the given range.
   *
   *
   * @param players The players to select from.
   * @param team The team to fill up with players.
   * @param minTeamSkill The mininum skill the team shall have.
   * @param maxTeamSkill The maximum skill the team shall have.
   *
   * @returns a player selection for the team or an error code.
   */
  selectPlayers(
    players: Array<Player>,
    team: Team,
    minTeamSkill: number,
    maxTeamSkill: number,
  ): Array<Player> | SelectorErrorCode;
}

export default class OptimalTeamPlayerSelector implements TeamPlayerSelector {
  /**
   * Constructor that optionally takes a random source interface as argument.
   * DefaultRandomSource is the default interface implementaion taken.
   *
   * @param randomSource The random source to be injected for randomized optimal team player selection.
   */
  constructor(private randomSource: RandomSource = new DefaultRandomSource()) {}

  /**
   * Generates a set of randomly selected players to complement a team optimized to a given skill range.
   * If the given set of players does not allow for the team to be within the given skill range the function
   * will provide a selection that is as close to the given skill ranges bounds (minimum or maximum respectively)
   * as possible.
   *
   * The function will validate the given input for missing player game skill assessments, player duplicates or if
   * given players are already on the team and if there are enough players provided to fill up the team. The team
   * will be checked if it even requires players to fill up.
   *
   *
   *
   * @param players The players to select from as an addition to the team.
   * @param team The team to select the players for.
   * @param minTeamSkill The minimum desired skill that the team should have with the selected players.
   * @param maxTeamSkill The maximum desired skill that the team should have with the selected players.
   * @returns
   */
  public selectPlayers(
    players: Array<Player>,
    team: Team,
    minTeamSkill: number,
    maxTeamSkill: number,
  ): Array<Player> | SelectorErrorCode {
    // Step 1: Validate input
    const validationResult: SelectorErrorCode | undefined =
      this.validateSelectorInput(players, team, minTeamSkill, maxTeamSkill);
    if (validationResult !== undefined) {
      return validationResult;
    }

    // Step 2: Select random players from list
    const amountOfPlayersToAdd: number = team.targetSize - team.currentSize;
    const [randomPlayerSelection, alternativePlayers] =
      this.selectRandomPlayers(players, amountOfPlayersToAdd);

    // Step 3: Check if team within bounds and optimize if not
    return this.optimizePlayerSelectionOutOfRange(
      randomPlayerSelection,
      alternativePlayers,
      team,
      minTeamSkill,
      maxTeamSkill,
    );
  }

  /**
   * This function validates if the given players have an assessed skill for the given game,
   * that none of the given players are already on the team and if there are enough players
   * to fill up the team to its target size.
   *
   * This validation shall be called prior to any other function call in the team generator!!!!
   *
   * @param players The player list to be validated in length (at least required amount to fill target team size)
   * @param minTeamSkill The minTeamskill must be validated in comparison with maxTeamSkill.
   * @param maxTeamSkill The maxTeamSkill must be validated in comparison with minTeamSkill.
   * @param team The team to check the amount of players to be added and game to be played.
   * @returns Error code if validation fails, undefined otherwise.
   */
  protected validateSelectorInput(
    players: Array<Player>,
    team: Team,
    minTeamSkill: number,
    maxTeamSkill: number,
  ): SelectorErrorCode | undefined {
    if (minTeamSkill < 0 || maxTeamSkill < 0) {
      return SelectorErrorCode.TeamSkillRangeNegative;
    }

    if (minTeamSkill > maxTeamSkill) {
      return SelectorErrorCode.MinTeamSkillExceedsMax;
    }

    // Step 1: Check if team does even need players to fill up
    if (team.isFull) {
      return SelectorErrorCode.TeamAlreadyFull;
    }

    //--> playerlist must not contain duplicates
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        if (players.at(i) === players.at(j)) {
          // TODO(tg): only reference check, deep comparison necessary?
          return SelectorErrorCode.PlayerListContainsDuplicates;
        }
      }
    }

    //--> playerlist must not contain team members
    for (const teamPlayer of team.allPlayers) {
      const match: Player | undefined = players.find(
        (element) => element === teamPlayer,
      );
      if (match !== undefined) {
        return SelectorErrorCode.PlayerListContainsTeamMembers;
      }
    }

    //--> at least missing amount of players to fill up team
    if (players.length <= team.targetSize - team.currentSize) {
      return SelectorErrorCode.NotEnoughPlayersProvided;
    }

    //--> each player must have a valid assessment for the given game
    for (const player of players) {
      if (!player.isSkillAssessedForGame(team.game)) {
        console.log('SKILL NOT ASSESSED FOR PLAYER ' + player.tag);
        return SelectorErrorCode.PlayerSkillsIncomplete;
      }
    }
    return undefined;
  }

  /**
   * This function returns a random selection of players from the given input.
   * If the the requested amount exceeds the given amount of players the player array
   * will be returned as it is.
   *
   * @param players The players to select randomly from.
   * @param amount The amount of random players to be selected.
   * @returns An array of randomly selected players.
   */
  protected selectRandomPlayers(
    players: Array<Player>,
    amount: number,
  ): [Array<Player>, Array<Player>] {
    const randomPlayers: Array<Player> = players;
    let playersToRemove: number =
      randomPlayers.length > amount ? randomPlayers.length - amount : 0;
    const remainingPlayers: Array<Player> = new Array<Player>();

    while (playersToRemove > 0) {
      const randomIndex: number = Math.floor(
        this.randomSource.getRandomNumber() * (randomPlayers.length - 1),
      );
      const removedPlayer: Player | undefined = randomPlayers
        .splice(randomIndex, 1)
        .at(0);
      if (removedPlayer !== undefined) {
        remainingPlayers.push(removedPlayer);
      }
      playersToRemove--;
    }

    return [randomPlayers, remainingPlayers];
  }

  /**
   * Checks if a given selection of players to be added to the team allow the team's skill to be within a specified range (min,max).
   * If not the function will try to swap players of the current selection with alternatives to find a solution which would allow
   * the team skill to be within range. If this is not possible with the given alternatives the function will try to minimize the
   * gap to the to either the lower or upper team skill bound respectively if possible.
   *
   * NOTE: This function will not alter any of the input parameters!
   *
   * @param currentPlayerSelection The players selected as addition to the team.
   * @param alternativePlayers The alternative players.
   * @param team The team to get skill references from.
   * @param minTeamSkill The lower bound of the allowed team skill range.
   * @param maxTeamSkill The upper bound of the allowed team skill range.
   * @returns An array of players optimized allowing the team to be in skill range or as close as possible to the valid range.
   */
  protected optimizePlayerSelectionOutOfRange(
    currentPlayerSelection: Array<Player>,
    alternativePlayers: Array<Player>,
    team: Team,
    minTeamSkill: number,
    maxTeamSkill: number,
  ): Array<Player> {
    // calculate teamskill for current selection
    let totalTeamSkill: number = team.getTeamGameSkill();
    for (const player of currentPlayerSelection) {
      totalTeamSkill += player.getSkillForGame(team.game);
    }

    // return current player selection if already in range
    if (minTeamSkill <= totalTeamSkill && totalTeamSkill <= maxTeamSkill) {
      return currentPlayerSelection;
    }

    // determine optimum team skill as reference for best swap selection
    const optimumTeamSkill: number = Math.abs(maxTeamSkill - minTeamSkill) / 2;

    // swap current selection players with alternatives until teamskill is in range
    // or swap if teamskill improves towards optimum (best we can do even if not in given skill range)
    const optimizedSelection: Array<Player> = currentPlayerSelection;
    for (const alternativePlayer of alternativePlayers) {
      // keep track of best possible swap selection if alternative does not allow team to get in range
      let potentialSwapPlayer: Player | undefined = undefined;
      let bestDistanceToOptimum: number = Math.abs(
        totalTeamSkill - optimumTeamSkill,
      ); //current best distance to optimum

      for (const player of optimizedSelection) {
        const teamSkillOnSwap: number =
          totalTeamSkill -
          player.getSkillForGame(team.game) +
          alternativePlayer.getSkillForGame(team.game);

        // CASE 1:
        // check if swap would already move team skill within range between min and max
        // stop here if it does and return the improved selection
        if (
          minTeamSkill <= teamSkillOnSwap &&
          teamSkillOnSwap <= maxTeamSkill
        ) {
          const playerIndexToRemove: number =
            optimizedSelection.indexOf(player);
          optimizedSelection.splice(playerIndexToRemove, 1);
          optimizedSelection.push(alternativePlayer);
          return optimizedSelection;
        }

        // CASE 2:
        // alternative does not move team already in range, let's check if alternative would
        // at least improve team towards optimum and update current best swap option
        const distanceToOptimum: number = Math.abs(
          teamSkillOnSwap - optimumTeamSkill,
        );
        if (bestDistanceToOptimum > distanceToOptimum) {
          bestDistanceToOptimum = distanceToOptimum;
          potentialSwapPlayer = player;
        }
      }

      // apply current best swap option if any and continue with next alternative
      if (potentialSwapPlayer !== undefined) {
        const playerIndexToRemove: number =
          optimizedSelection.indexOf(potentialSwapPlayer);
        optimizedSelection.splice(playerIndexToRemove, 1);
        optimizedSelection.push(alternativePlayer);
        totalTeamSkill =
          totalTeamSkill -
          potentialSwapPlayer.getSkillForGame(team.game) +
          alternativePlayer.getSkillForGame(team.game);
      }
    }

    return optimizedSelection;
  }
}
