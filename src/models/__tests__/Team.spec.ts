import { describe, it, expect } from 'vitest';

import Team from '../Team';
import Player from '../Player';
import GameSkill from '../GameSkill';
import Game from '../Game';

const game: Game = new Game('CSGO', 'Shooter');
const player1: Player = new Player('AWESOM-O', 'Jon', 'Doe');
player1.addGameSkill(new GameSkill(game, 3));
const player2: Player = new Player('McAwesome', 'Max', 'Mustermann');
player2.addGameSkill(new GameSkill(game, 5));

describe('Constructor Test', () => {
  it('Construct properly.', () => {
    const team: Team = new Team('team-name', 3, game);
    expect(team.name).toEqual('team-name');
    expect(team.targetSize).toEqual(3);
    expect(team.currentSize).toEqual(0);
    expect(team.isFull).toBe(false);
  });
});

describe('Configuration Tests', () => {
  it('Shall allow to change its name.', () => {
    const team: Team = new Team('team-name', 3, game);
    expect(team.name).toEqual('team-name');
    team.name = 'other-name';
    expect(team.name).toEqual('other-name');
  });

  it('Shall allow to add player when not already full.', () => {
    const team: Team = new Team('team-name', 3, game);
    expect(team.currentSize).toEqual(0);

    expect(team.addPlayer(player1)).toBe(true);
    expect(team.currentSize).toEqual(1);
    expect(team.isFull).toBe(false);
  });

  it('Shall allow to add substitution player when not already full.', () => {
    const team: Team = new Team('team-name', 3, game);
    expect(team.currentSize).toEqual(0);

    expect(team.addSubstitutionPlayer(player1)).toBe(true);
    expect(team.currentSize).toEqual(1);
    expect(team.isFull).toBe(false);
  });

  it('Shall not allow to add the same player twice.', () => {
    const team: Team = new Team('team-name', 3, game);
    expect(team.currentSize).toEqual(0);

    expect(team.addPlayer(player1)).toBe(true);
    expect(team.currentSize).toEqual(1);

    expect(team.addPlayer(player1)).toBe(false);
    expect(team.currentSize).toEqual(1);
  });

  it('Shall not allow to add the same substitution player twice.', () => {
    const team: Team = new Team('team-name', 3, game);
    expect(team.currentSize).toEqual(0);

    expect(team.addSubstitutionPlayer(player1)).toBe(true);
    expect(team.currentSize).toEqual(1);

    expect(team.addSubstitutionPlayer(player1)).toBe(false);
    expect(team.currentSize).toEqual(1);
  });

  it('Shall not allow to add the same player as substitution player.', () => {
    const team: Team = new Team('team-name', 3, game);
    expect(team.currentSize).toEqual(0);

    expect(team.addPlayer(player1)).toBe(true);
    expect(team.currentSize).toEqual(1);

    expect(team.addSubstitutionPlayer(player1)).toBe(false);
    expect(team.currentSize).toEqual(1);
  });

  it('Shall not allow to add the same substitution player as player.', () => {
    const team: Team = new Team('team-name', 3, game);
    expect(team.currentSize).toEqual(0);

    expect(team.addSubstitutionPlayer(player1)).toBe(true);
    expect(team.currentSize).toEqual(1);

    expect(team.addPlayer(player1)).toBe(false);
    expect(team.currentSize).toEqual(1);
  });

  it('Shall allow to add different players.', () => {
    const team: Team = new Team('team-name', 3, game);
    expect(team.currentSize).toEqual(0);

    expect(team.addPlayer(player1)).toBe(true);
    expect(team.addPlayer(player2)).toBe(true);
    expect(team.currentSize).toEqual(2);
  });

  it('Shall allow to add different substitution players.', () => {
    const team: Team = new Team('team-name', 3, game);
    expect(team.currentSize).toEqual(0);

    expect(team.addSubstitutionPlayer(player1)).toBe(true);
    expect(team.addSubstitutionPlayer(player2)).toBe(true);
    expect(team.currentSize).toEqual(2);
  });

  it('Shall allow to add different player as substitution player.', () => {
    const team: Team = new Team('team-name', 3, game);
    expect(team.currentSize).toEqual(0);

    expect(team.addPlayer(player1)).toBe(true);
    expect(team.addSubstitutionPlayer(player2)).toBe(true);
    expect(team.currentSize).toEqual(2);
    expect(team.isPlayerInTeam(player1)).toBe(true);
    expect(team.isPlayerInTeam(player2)).toBe(true);
    expect(team.fixedPlayers).toContain(player1);
    expect(team.substitutionPlayers).toContain(player2);
  });

  it('Shall not allow to add players with no skill assessed for corresponding team game.', () => {
    const team: Team = new Team('team-name', 2, game);
    expect(team.currentSize).toEqual(0);

    const player3: Player = new Player('SkillUnkown', 'Jon', 'Doe');

    expect(team.addPlayer(player3)).toBe(false);
    expect(team.fixedPlayers).not.toContain(player3);

    expect(team.addSubstitutionPlayer(player3)).toBe(false);
    expect(team.substitutionPlayers).not.toContain(player3);
  });

  it('Shall not allow more players than target size.', () => {
    const team: Team = new Team('team-name', 2, game);
    expect(team.currentSize).toEqual(0);

    expect(team.addPlayer(player1)).toBe(true);
    expect(team.addPlayer(player2)).toBe(true);
    expect(team.currentSize).toEqual(2);
    expect(team.fixedPlayers).toContain(player1);
    expect(team.fixedPlayers).toContain(player2);
    expect(team.isFull).toBe(true);

    const player3: Player = new Player('NotInvited', 'The', 'Devil');
    player3.addGameSkill(new GameSkill(game, 3));
    expect(team.addPlayer(player3)).toBe(false);
    expect(team.fixedPlayers).not.toContain(player3);
  });

  it('Shall allow to remove players.', () => {
    const team: Team = new Team('team-name', 3, game);
    expect(team.currentSize).toEqual(0);

    expect(team.addPlayer(player1)).toBe(true);
    expect(team.addSubstitutionPlayer(player2)).toBe(true);
    expect(team.currentSize).toEqual(2);

    team.removePlayer(player1);
    expect(team.currentSize).toEqual(1);
    expect(team.isPlayerInTeam(player1)).toBe(false);

    expect(team.isPlayerInTeam(player2)).toBe(true);
  });

  it('Shall allow to remove all fixed players at once.', () => {
    const team: Team = new Team('team-name', 3, game);
    expect(team.currentSize).toEqual(0);

    expect(team.addPlayer(player1)).toBe(true);
    expect(team.addPlayer(player2)).toBe(true);
    expect(team.currentSize).toEqual(2);

    team.clearFixedPlayers();
    expect(team.currentSize).toEqual(0);
  });

  it('Shall allow to remove substitution players.', () => {
    const team: Team = new Team('team-name', 3, game);
    expect(team.currentSize).toEqual(0);

    expect(team.addPlayer(player1)).toBe(true);
    expect(team.addSubstitutionPlayer(player2)).toBe(true);
    expect(team.currentSize).toEqual(2);

    team.removePlayer(player2);
    expect(team.currentSize).toEqual(1);
    expect(team.isPlayerInTeam(player2)).toBe(false);

    expect(team.isPlayerInTeam(player1)).toBe(true);
  });

  it('Shall allow to remove all substitution players at once.', () => {
    const team: Team = new Team('team-name', 3, game);
    expect(team.currentSize).toEqual(0);

    expect(team.addSubstitutionPlayer(player1)).toBe(true);
    expect(team.addSubstitutionPlayer(player2)).toBe(true);
    expect(team.currentSize).toEqual(2);

    team.clearSubstitutionPlayers();
    expect(team.currentSize).toEqual(0);
  });
});

describe('Team properties tests.', () => {
  it('Shall calculate the skill sum of the team properly.', () => {
    const team: Team = new Team('team-name', 3, game);

    team.addPlayer(player1);
    team.addPlayer(player2);
    expect(team.getTeamGameSkill()).toBeDefined;
    expect(team.getTeamGameSkill()).toEqual(8);
  });
});
