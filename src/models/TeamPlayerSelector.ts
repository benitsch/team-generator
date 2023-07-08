import type Game from "@/models/Game";
import GameSkill from "@/models/GameSkill";
import Player from "@/models/Player";
import Team from "@/models/Team";

export default class TeamPlayerSelector {


    public static selectSuitablePlayers(players: Array<Player>, team: Team, minTeamSkill: number, maxTeamSkill: number): Array<Player> {
        
        // Step 1: validate input (players need game skill assessed, enough players available to fill up team)
        // --> remove players from input which are already on the team!!

        // Step 2: add random players from list

        // Step 3: check if team within bounds

        // Step 4:  if team above MAX then optimize by replacing highest player (of newly added)
        //          if team below MIN then optimize by replacing lowest player (of newly added)

        // Step 5: return team or error if no players could be added without violating the boundaries??
        return new Array<Player>();
    }
}