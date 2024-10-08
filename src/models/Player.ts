import { v4 as uuidv4 } from 'uuid';
import type Game from '@/models/Game';
import type GameSkill from '@/models/GameSkill';

export default class Player {
  private _id: string = '';
  private _tag: string = '';
  private _firstName: string = '';
  private _lastName: string = '';
  private _gameSkills: GameSkill[] = [];

  constructor(tag?: string, firstName?: string, lastName?: string) {
    this._id = uuidv4();
    this._tag = tag || '';
    this._firstName = firstName || '';
    this._lastName = lastName || '';
    this._gameSkills = [];
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

  addGameSkill(skill: GameSkill): void {
    this._gameSkills.push(skill);
  }

  isSkillAssessedForGame(game: Game): boolean {
    for (const gameSkill of this._gameSkills) {
      if (gameSkill.game.id === game.id) {
        if (gameSkill.skillLevel > 0) {
          return true;
        }
        break;
      }
    }
    return false;
  }

  getSkillForGame(game: Game): number {
    for (const gameSkill of this._gameSkills) {
      if (gameSkill.game.id === game.id) {
        return gameSkill.skillLevel;
      }
    }
    return 0;
  }

  getFullName(): string {
    return this._firstName + ' ' + this._lastName;
  }
}
