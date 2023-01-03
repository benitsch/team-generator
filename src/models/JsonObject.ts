import type Player from "@/models/Player";
import type Game from "@/models/Game";

export default class JsonObject {
  private _player = [] as Player[];
  private _games = [] as Game[];

  get player(): Player[] {
    return this._player;
  }

  set player(value: Player[]) {
    this._player = value;
  }

  get games(): Game[] {
    return this._games;
  }

  set games(value: Game[]) {
    this._games = value;
  }
}