 import { describe, it, expect } from "vitest";

 import Team from "../../../models/Team";

 describe("Constructor Test", () => {

   it("Constructs properly.", () => {
    const team = new Team("team-name", 3);
    expect(team.name).toEqual("team-name");
    expect(team.targetSize).toEqual(3);
    expect(team.currentSize).toEqual(0);
    expect(team.isFull).toBeFalsy;
   });
  

 });
