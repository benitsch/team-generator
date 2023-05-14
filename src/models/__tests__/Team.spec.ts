 import { describe, it, expect } from "vitest";

 import Team from "../Team";
 import Player from "../Player";
import GameSkill from "../GameSkill";
import Game from "../Game";

 describe("Constructor Test", () => {

   it("Construct properly.", () => {
    const team: Team = new Team("team-name", 3);
    expect(team.name).toEqual("team-name");
    expect(team.targetSize).toEqual(3);
    expect(team.currentSize).toEqual(0);
    expect(team.isFull).toBeFalsy;
   });
  

 });

 describe("Configuration Tests", () => {

  it("Shall allow to change its name.", () => {
   const team: Team = new Team("team-name", 3);
   expect(team.name).toEqual("team-name");
   team.name = "other-name";
   expect(team.name).toEqual("other-name");
  });

  it("Shall allow to add player when not already full.", () => {
    const team: Team = new Team("team-name", 3);
    expect(team.currentSize).toEqual(0);

    const player: Player = new Player("AWESOM-O", "Jon", "Doe");
    expect(team.addPlayer(player)).toBeTruthy;
    expect(team.currentSize).toEqual(1);
    expect(team.isFull).toBeFalsy;
   });

   it("Shall allow to add substitution player when not already full.", () => {
    const team: Team = new Team("team-name", 3);
    expect(team.currentSize).toEqual(0);

    const player: Player = new Player("AWESOM-O", "Jon", "Doe");
    expect(team.addSubstitutionPlayer(player)).toBeTruthy;
    expect(team.currentSize).toEqual(1);
    expect(team.isFull).toBeFalsy;
   });

   it("Shall not allow to add the same player twice.", () => {
    const team: Team = new Team("team-name", 3);
    expect(team.currentSize).toEqual(0);

    const player: Player = new Player("AWESOM-O", "Jon", "Doe");
    expect(team.addPlayer(player)).toBeTruthy;
    expect(team.currentSize).toEqual(1);

    expect(team.addPlayer(player)).toBeFalsy;
    expect(team.currentSize).toEqual(1);

   });

   it("Shall not allow to add the same substitution player twice.", () => {
    const team: Team = new Team("team-name", 3);
    expect(team.currentSize).toEqual(0);

    const player: Player = new Player("AWESOM-O", "Jon", "Doe");
    expect(team.addSubstitutionPlayer(player)).toBeTruthy;
    expect(team.currentSize).toEqual(1);

    expect(team.addSubstitutionPlayer(player)).toBeFalsy;
    expect(team.currentSize).toEqual(1);

   });

   it("Shall not allow to add the same player as substitution player.", () => {
    const team: Team = new Team("team-name", 3);
    expect(team.currentSize).toEqual(0);

    const player: Player = new Player("AWESOM-O", "Jon", "Doe");
    expect(team.addPlayer(player)).toBeTruthy;
    expect(team.currentSize).toEqual(1);

    expect(team.addSubstitutionPlayer(player)).toBeFalsy;
    expect(team.currentSize).toEqual(1);

   });

   it("Shall not allow to add the same substitution player as player.", () => {
    const team: Team = new Team("team-name", 3);
    expect(team.currentSize).toEqual(0);

    const player: Player = new Player("AWESOM-O", "Jon", "Doe");
    expect(team.addSubstitutionPlayer(player)).toBeTruthy;
    expect(team.currentSize).toEqual(1);

    expect(team.addPlayer(player)).toBeFalsy;
    expect(team.currentSize).toEqual(1);

   });

   it("Shall allow to add different players.", () => {
    const team: Team = new Team("team-name", 3);
    expect(team.currentSize).toEqual(0);

    const player1: Player = new Player("AWESOM-O", "Jon", "Doe");
    const player2: Player = new Player("McAwesome", "Max", "Mustermann");
    expect(team.addPlayer(player1)).toBeTruthy;
    expect(team.addPlayer(player2)).toBeTruthy;
    expect(team.currentSize).toEqual(2);

   });

   it("Shall allow to add different substitution players.", () => {
    const team: Team = new Team("team-name", 3);
    expect(team.currentSize).toEqual(0);

    const player1: Player = new Player("AWESOM-O", "Jon", "Doe");
    const player2: Player = new Player("McAwesome", "Max", "Mustermann");
    expect(team.addSubstitutionPlayer(player1)).toBeTruthy;
    expect(team.addSubstitutionPlayer(player2)).toBeTruthy;
    expect(team.currentSize).toEqual(2);

   });

   it("Shall allow to add different player as substitution player.", () => {
    const team: Team = new Team("team-name", 3);
    expect(team.currentSize).toEqual(0);

    const player1: Player = new Player("AWESOM-O", "Jon", "Doe");
    const player2: Player = new Player("McAwesome", "Max", "Mustermann");
    expect(team.addPlayer(player1)).toBeTruthy;
    expect(team.addSubstitutionPlayer(player2)).toBeTruthy;
    expect(team.currentSize).toEqual(2);
    expect(team.isPlayerInTeam(player1)).toBeTruthy;
    expect(team.isPlayerInTeam(player2)).toBeTruthy;
    expect(team.fixedPlayers).toContain(player1);
    expect(team.substitutionPlayers).toContain(player2);

   });

   it("Shall not allow more players than target size.", () => {
    const team: Team = new Team("team-name", 2);
    expect(team.currentSize).toEqual(0);

    const player1: Player = new Player("AWESOM-O", "Jon", "Doe");
    const player2: Player = new Player("McAwesome", "Max", "Mustermann");

    expect(team.addPlayer(player1)).toBeTruthy;
    expect(team.addPlayer(player2)).toBeTruthy;
    expect(team.currentSize).toEqual(2);
    expect(team.fixedPlayers).toContain(player1);
    expect(team.fixedPlayers).toContain(player2);
    expect(team.isFull).toBeTruthy;


    const player3: Player = new Player("NotInvited", "The", "Devil");
    expect(team.addPlayer(player3)).toBeFalsy
    expect(team.fixedPlayers).not.toContain(player3);

   });

   it("Shall allow to remove players.", () => {
    const team: Team = new Team("team-name", 3);
    expect(team.currentSize).toEqual(0);

    const player1: Player = new Player("AWESOM-O", "Jon", "Doe");
    const player2: Player = new Player("McAwesome", "Max", "Mustermann");
    expect(team.addPlayer(player1)).toBeTruthy;
    expect(team.addSubstitutionPlayer(player2)).toBeTruthy;
    expect(team.currentSize).toEqual(2);
    
    team.removePlayer(player1);
    expect(team.currentSize).toEqual(1);
    expect(team.isPlayerInTeam(player1)).toBeFalsy;

    expect(team.isPlayerInTeam(player2)).toBeTruthy;

   });

   it("Shall allow to remove substitution players.", () => {
    const team: Team = new Team("team-name", 3);
    expect(team.currentSize).toEqual(0);

    const player1: Player = new Player("AWESOM-O", "Jon", "Doe");
    const player2: Player = new Player("McAwesome", "Max", "Mustermann");
    expect(team.addPlayer(player1)).toBeTruthy;
    expect(team.addSubstitutionPlayer(player2)).toBeTruthy;
    expect(team.currentSize).toEqual(2);
    
    team.removePlayer(player2);
    expect(team.currentSize).toEqual(1);
    expect(team.isPlayerInTeam(player2)).toBeFalsy;

    expect(team.isPlayerInTeam(player1)).toBeTruthy;

   });

});

describe("Team properties tests.", () => {

  const game: Game = new Game("CSGO", "Shooter");

  it("Shall consider a game skill unspecified if no player is in the team.", () => {
   const team: Team = new Team("team-name", 3);
   expect(team.isSkillAssessedForGame).toBeFalsy;

  });

  it("Shall consider a game skill unspecified only one player has no specified skill for the game.", () => {
    const team: Team = new Team("team-name", 3);
    let player: Player = new Player("AWESOM-O", "Jon", "Doe");
    team.addPlayer(player);
    expect(team.isSkillAssessedForGame).toBeFalsy;
 
   });

   it("Shall consider a game skill specified if all players have the game skill specified.", () => {
    const team: Team = new Team("team-name", 3);
    let player1: Player = new Player("AWESOM-O", "Jon", "Doe");
    player1.addGameSkill(new GameSkill(game, 3));
    let player2: Player = new Player("McAwesome", "Max", "Mustermann");
    player2.addGameSkill(new GameSkill(game, 5));

    team.addPlayer(player1);
    team.addPlayer(player2);
    expect(team.isSkillAssessedForGame).toBeTruthy;
 
   });

   it("Shall calculate the skill sum of the team properly.", () => {
    const team: Team = new Team("team-name", 3);
    let player1: Player = new Player("AWESOM-O", "Jon", "Doe");
    player1.addGameSkill(new GameSkill(game, 3));
    let player2: Player = new Player("McAwesome", "Max", "Mustermann");
    player2.addGameSkill(new GameSkill(game, 5));

    team.addPlayer(player1);
    team.addPlayer(player2);
    expect(team.getSkillForGame(game)).toBeDefined;
    expect(team.getSkillForGame(game)).toEqual(8);
 
   });
 

});
