import {v4 as uuidv4} from "uuid";
import Team from "@/models/Team";

export default class Match {
    private _id = "";
    private _team: Team;
    private _oppositeTeam:Team|null;

    constructor(team: Team, oppositeTeam: Team) {
        this._id = uuidv4();
        this._team = team;
        this._oppositeTeam = oppositeTeam;
    }


    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get team(): Team {
        return this._team;
    }

    set team(value: Team) {
        this._team = value;
    }

    get oppositeTeam(): Team|null {
        return this._oppositeTeam;
    }

    set oppositeTeam(value: Team) {
        this._oppositeTeam = value;
    }

    hasOppositeTeam(): boolean {
        return this._oppositeTeam != null;
    }
}