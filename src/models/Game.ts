import {v4 as uuidv4} from "uuid";

export default class Game {
    private _id = "";
    private _name = "";
    private _genre = "";

    constructor() {
        this._id = uuidv4();
    }

    get game(): Game {
        return this;
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get genre(): string {
        return this._genre;
    }

    set genre(value: string) {
        this._genre = value;
    }
}