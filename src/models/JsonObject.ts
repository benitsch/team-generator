import type Player from '@/models/Player';
import type Game from '@/models/Game';

export default class JsonObject {
  private _players: Player[] = [];
  private _games: Game[] = [];

  get players(): Player[] {
    return this._players;
  }

  set players(value: Player[]) {
    this._players = value;
  }

  get games(): Game[] {
    return this._games;
  }

  set games(value: Game[]) {
    this._games = value;
  }
}
