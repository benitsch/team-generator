
import type Game from "@/models/Game";
import type GameSkill from "@/models/GameSkill";
import type Player from "@/models/Player";
import type Team from "@/models/Team";
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
     * Let N be the amount of teams.
     * 
     * Sort teams descending by ther skill.
     * 
     * Repeat optimization step N/2 times or until no further optimization can be achieved.
     * 
     *  --> Compare best and worst team and if there's a skill diff then swap players until optimum reached.
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
    static generate(players: Array<Player>, teamSize: number ,game: Game): Array<Team> {

        //Step 1: do proper param check (player length, teamSize and game skill != 0 for all player)
            //--> at least 2 full teams need to be createable: player.length >= 2* teamSize

        //Step 2: order players by their skill ascending and shuffle players with same skill in array
        
        //Step 3: calculate the amount of teams creatable out of the player list and create them(player.length % teamSize may be > 0)

        //Step 4: Alternate between forward and backward looping over teams and add one player at a time(from high to low skill)

        //Step 5: Refine team balance (swap players between best and worst team if possible)

        //Step 6: If any team not full (create possible substition player list ascending by fairness regarding balance)

        return [];
    }

}