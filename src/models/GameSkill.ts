import {v4 as uuidv4} from "uuid";
import type Game from "@/models/Game";

export default class GameSkill {
    private _id = "";
    private readonly _game: Game;
    private _skillLevel = 0;

    constructor(game: Game, skillLevel?: number) {
        this._id = uuidv4();
        this._game = game;
        if(skillLevel){
            this._skillLevel = skillLevel;
        }
    }

    get id(): string {
        return this._id;
    }

    get game(): Game {
        return this._game;
    }

    get skillLevel(): number {
        return this._skillLevel;
    }

    set skillLevel(value: number) {
        this._skillLevel = value;
    }
}