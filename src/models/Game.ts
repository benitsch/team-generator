import {v4 as uuidv4} from "uuid";

export default class Game {
    private _id = "";
    private _name = "";
    private _genre = ""; //TODO(tg): discuss whether this should be an enum or stay string (and maybe if multiple genres could apply?)

    constructor(name?: string, genre?: string) { //TODO(tg): make params readonly? Should not change.
        this._id = uuidv4();
        if(name){
            this._name = name;
        }

        if(genre){
            this._genre = genre;
        }
    }

    get game(): Game { //TODO(tg): invest what this is for
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