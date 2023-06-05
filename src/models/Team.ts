import {v4 as uuidv4} from "uuid";
import type Player from "@/models/Player";
import type Game from "@/models/Game";

export default class Team {
    private _id = "";
    private _name = "";
    private _targetSize = 0;
    private _playerList: Array<Player> = [];
    private _substitutionPlayerList: Array<Player> = [];

    constructor(name: string, targetSize: number) {
        this._id = uuidv4();
        this._name = name;
        this._targetSize = targetSize;
    }

    get id(): string {
        return this._id;
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
        return this._playerList.length + this._substitutionPlayerList.length;
    }

    get isFull(): boolean {
        return this.currentSize == this.targetSize;
    }

    addPlayer(player: Player): boolean {
        if (!this.isFull && !this.isPlayerInTeam(player)){
            this._playerList.push(player);
            return true;
        }else {
            return false;
        }
    }

    addSubstitutionPlayer(player: Player): boolean {
        if (!this.isFull && !this.isPlayerInTeam(player)){
            this._substitutionPlayerList.push(player);
            return true;
        }else {
            return false;
        }
    }

    removePlayer(player: Player): void {
        const listIndexPlayer: number = this._playerList.indexOf(player, 0);
        if (listIndexPlayer > -1){
            this._playerList.splice(listIndexPlayer, 1);
        }

        const listIndexSubPlayer: number = this._substitutionPlayerList.indexOf(player, 0);
        if (listIndexSubPlayer > -1){
            this._substitutionPlayerList.splice(listIndexSubPlayer, 1);
        }
    }

    clearFixedPlayers(): void {
        this._playerList.splice(0);
    }

    clearSubstitutionPlayers(): void {
        this._substitutionPlayerList.splice(0);
    }

    isPlayerInTeam(player: Player): boolean {
        return this._playerList.includes(player) || this._substitutionPlayerList.includes(player);
    }

    isSkillAssessedForGame(game: Game): boolean{
        if(this.fixedPlayers.length === 0){
            return false;
        }
        for (const player of this.allPlayers){
            if(!player.isSkillAssessedForGame(game)){
                return false;
            }
        }
        return true;
    }

    getSkillForGame(game: Game): number {
        let skill: number = 0;
        for (const player of this.allPlayers){
            skill += player.getSkillForGame(game);
        }
        return skill;
    }


    get fixedPlayers(): ReadonlyArray<Player> {
        return this._playerList;
    }

    get substitutionPlayers(): ReadonlyArray<Player> {
        return this._substitutionPlayerList;
    }

    get allPlayers(): ReadonlyArray<Player> {
        return this.fixedPlayers.concat(this.substitutionPlayers);
    }

}