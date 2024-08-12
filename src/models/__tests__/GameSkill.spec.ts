import { describe, it, expect } from 'vitest';

import Game from '../Game';
import GameSkill from '../GameSkill';

describe('Constructor Tests', () => {
  const game: Game = new Game('Mario Kart', 'Racing');

  it('Should construct with default skill level.', () => {
    const gameSkill: GameSkill = new GameSkill(game);
    expect(gameSkill.game).toEqual(game);
    expect(gameSkill.skillLevel).toEqual(0);
  });

  it('Should construct with specified skill level.', () => {
    const gameSkill: GameSkill = new GameSkill(game, 3);
    expect(gameSkill.game).toEqual(game);
    expect(gameSkill.skillLevel).toEqual(3);
  });
});

describe('Configuration Tests', () => {
  const game: Game = new Game('Mario Kart', 'Racing');

  it('Should allow to change skillLevel.', () => {
    const gameSkill: GameSkill = new GameSkill(game);
    gameSkill.skillLevel = 3;
    expect(gameSkill.game).toEqual(game);
    expect(gameSkill.skillLevel).toEqual(3);
  });
});
