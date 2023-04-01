import { v4 as uuidv4 } from "uuid";

export default class Player {
  private _id = "";
  private _tag = "";
  private _firstName = "";
  private _lastName = "";

  constructor() {
    this._id = uuidv4();
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

  getFullName():string {
    return this._firstName + " " + this._lastName;
  }
}