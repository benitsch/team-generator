 import { describe, it, expect } from "vitest";

 import Team from "../../../models/Team";

 describe("Constructor Test", () => {
   it("Constructs properly", () => {
    const team = new Team("team1", 3, []);
    expect(team.name, "team1");
   });
 });
