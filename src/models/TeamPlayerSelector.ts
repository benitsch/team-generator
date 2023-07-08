import type Game from "@/models/Game";
import GameSkill from "@/models/GameSkill";
import Player from "@/models/Player";
import Team from "@/models/Team";


export default class TeamPlayerSelector {

    public static addFixedPlayersToTeam(team: Team, players: Array<Player>, game: Game, minTeamSkill: number, maxTeamSkill: number): Team{
        return team;
    }

    public static addSubstitutionPlayersToTeam(team: Team, players: Array<Player>, game: Game, minTeamSkill: number, maxTeamSkill: number): Team{
        return team;
    }
}