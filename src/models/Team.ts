import {v4 as uuidv4} from "uuid";
import type Player from "@/models/Player";

export default class Team {
    private _id = "";
    private _name = "";
    private _targetSize = 0;
    private _playerList: Array<Player> = [];

    constructor(name: string, targetSize: number, playerList: Array<Player>) {
        this._id = uuidv4();
        this._name = name;
        this._targetSize = targetSize;
        this._playerList = playerList;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get targetSize(): number {
        return this._targetSize;
    }

    get currentSize(): number{
        return this._playerList.length;
    }

    addPlayer(player: Player): boolean {
        if (!this._playerList.includes(player) && this.currentSize < this.targetSize){
            this._playerList.push(player);
            return true;
        }else {
            return false;
        }
    }

    get player(): ReadonlyArray<Player> {
        return this._playerList;
    }

}