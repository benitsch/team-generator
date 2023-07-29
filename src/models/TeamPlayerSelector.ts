import Game from "@/models/Game";
import GameSkill from "@/models/GameSkill";
import Player from "@/models/Player";
import Team from "@/models/Team";

/** This error code is used to determine different invalid input constellations */
export enum SelectorErrorCode {
    NotEnoughPlayersProvided = 1,
    PlayerSkillsIncomplete,
    TeamAlreadyFull,
    PlayerListContainsTeamMembers,
    PlayerListContainsDuplicates,
  }

export default class TeamPlayerSelector {


    public static selectSuitablePlayers(players: Array<Player>, team: Team, minTeamSkill: number, maxTeamSkill: number): Array<Player> | SelectorErrorCode {

        // Step 1: Check if team does even need players to fill up
        if (team.isFull){
            return SelectorErrorCode.TeamAlreadyFull;
        }
        
        // Step 2: Validate input 
        let validationResult: SelectorErrorCode | undefined = this.validateSelectorInput(players, team);
        if (validationResult !== undefined){
            return validationResult;
        }
        
        // Step 3: add random players from list
        let amountOfPlayersToAdd: number = team.targetSize - team.currentSize;
        let [randomPlayers, remainingPlayers] = this.selectRandomPlayers(players, amountOfPlayersToAdd);

        // Step 4: check if team within bounds
        let totalSkill: number = team.getTeamGameSkill();
        for(const player of randomPlayers){
            totalSkill += player.getSkillForGame(team.game);
        }

        if (totalSkill >= minTeamSkill && totalSkill <= maxTeamSkill){
            return randomPlayers;
        }

        // Step 5:  if team above MAX then optimize by replacing highest player (of newly added)
        //          if team below MIN then optimize by replacing lowest player (of newly added)
        // TODO(tg):    swap 1 remaining player with first fitting random player (which ensures that team is in bounds)
        //              if none fitting track optimum to swap with this one
        //              repeat step one until fitting remaining swap player found or no remaining players available
        

        // Step 6: return team or error if no players could be added without violating the boundaries??
        return new Array<Player>();
    }

    /**
     * This function validates if the given players have an assessed skill for the given game,
     * that none of the given players are already on the team and if there are enough players 
     * to fill up the team to its target size.
     * 
     * This validation shall be called prior to any other function call in the team generator!!!!
     * 
     * @param players The player list to be validated in length (at least required amount to fill target team size)
     * @param team The team to check the amount of players to be added and game to be played.
     * @returns Error code if validation fails, undefined otherwise.
     */
    protected static validateSelectorInput(players: Array<Player>, team: Team): SelectorErrorCode | undefined {

        //--> playerlist must not contain duplicates
        for(let i = 0; i < players.length; i++){
            for (let j = i + 1; j < players.length; j++){
                if (players.at(i) === players.at(j)){ // TODO(tg): only reference check, deep comparison necessary?
                    return SelectorErrorCode.PlayerListContainsDuplicates;
                }
            }
        }

        //--> playerlist must not contain team members
        for (const teamPlayer of team.allPlayers){
            let match: Player | undefined = players.find(element => element === teamPlayer);
            if (match !== undefined){
                return SelectorErrorCode.PlayerListContainsTeamMembers;
            }
        }

        //--> at least missing amount of players to fill up team
        if(players.length >= (team.targetSize - team.currentSize)){
         return SelectorErrorCode.NotEnoughPlayersProvided;
        }

        //--> each player must have a valid assessment for the given game
        for (const player of players){
            if(!player.isSkillAssessedForGame(team.game)){
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
    protected static selectRandomPlayers(players: Array<Player>, amount: number): [Array<Player>, Array<Player>] {
        let randomPlayers: Array<Player> = players;
        let playersToRemove: number = randomPlayers.length > amount? randomPlayers.length - amount : 0;
        let remainingPlayers: Array<Player> = new Array<Player>();

        while (playersToRemove > 0){
            let randomIndex: number = Math.floor(Math.random() * (randomPlayers.length - 1));
            let removedPlayer: Player | undefined = randomPlayers.splice(randomIndex, 1).at(0); //TODO(tg): check how to ensure result is not undefined!!!
            if (removedPlayer !== undefined){
                remainingPlayers.push(removedPlayer);
            }
            playersToRemove --;
        }

        return [randomPlayers, remainingPlayers];

    } 
}