import {v4 as uuidv4} from "uuid";
import type Game from "@/models/Game";
import type GameSkill from "@/models/GameSkill";

export default class Player {
    private _id = "";
    private _tag = "";
    private _firstName = "";
    private _lastName = "";
    private _gameSkills: GameSkill[] = [];


    constructor(tag?: string, firstName?: string, lastName?: string) {
        this._id = uuidv4();

        if (tag){
            this._tag = tag;
        }
        
        if (firstName){
            this._firstName = firstName;
        }

        if (lastName){
            this._lastName = lastName;
        }

    }


    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get tag(): string {
        return this._tag;
    }

    set tag(value: string) {
        this._tag = value;
    }

    get firstName(): string {
        return this._firstName;
    }

    set firstName(value: string) {
        this._firstName = value;
    }

    get lastName(): string {
        return this._lastName;
    }

    set lastName(value: string) {
        this._lastName = value;
    }

    get gameSkills(): GameSkill[] {
        return this._gameSkills;
    }

    set gameSkills(value: GameSkill[]) {
        this._gameSkills = value;
    }


    addGameSkill(skill: GameSkill) {
        this._gameSkills.push(skill);
    }

    isSkillAssessedForGame(game: Game): boolean{
        for (const gameSkill of this._gameSkills){
            if(gameSkill.game === game){
                if (gameSkill.skillLevel > 0){
                    return true;
                }
                break;
            }
        }
        return false;
    }

    getSkillForGame(game: Game): number {
        for (const gameSkill of this._gameSkills){
            if(gameSkill.game === game){
                return gameSkill.skillLevel;
            }
        }
        return 0;
    }

    getFullName(): string {
        return this._firstName + " " + this._lastName;
    }
}