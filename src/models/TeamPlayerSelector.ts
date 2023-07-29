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

        // Step 4: check if team within bounds

        // Step 5:  if team above MAX then optimize by replacing highest player (of newly added)
        //          if team below MIN then optimize by replacing lowest player (of newly added)

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

}