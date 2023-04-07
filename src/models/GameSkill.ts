import { v4 as uuidv4 } from "uuid";
import type Game from "@/models/Game";

export default class GameSkill {
    private _id = "";
    private _game: Game | undefined;
    private _skillLevel = 0;

    constructor() {
        this._id = uuidv4();
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get game(): Game | undefined {
        return this._game;
    }

    set game(value: Game | undefined) {
        this._game = value;
    }

    get skillLevel(): number {
        return this._skillLevel;
    }

    set skillLevel(value: number) {
        this._skillLevel = value;
    }
}