 import { describe, it, expect } from "vitest";

 import Team from "../../../models/Team";

 describe("Constructor Test", () => {
   it("Constructs without playerlist", () => {
    const team = new Team("team-name", 3, []);
    expect(team.name).toEqual("team-name");
    expect(team.targetSize).toEqual(3);
   });
 });
