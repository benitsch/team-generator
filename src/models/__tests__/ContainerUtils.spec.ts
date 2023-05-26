import { describe, it, expect } from "vitest";

import {ContainerUtils} from "../ContainerUtils";

describe("Array Shuffle Tests", () => {

  const array: Array<number> = [1, 2, 3];

  it("Should not remove any element from an array.", () => {
   
    const arrSize = array.length;
    ContainerUtils.shuffleArray(array);
    expect(array.length).toEqual(arrSize);

  });

  it("Should not change any element from an array.", () => {
   
    ContainerUtils.shuffleArray(array);
    expect(array).toContain(1);
    expect(array).toContain(2);
    expect(array).toContain(3);

  });


});

describe("Array Mapping Tests", () => {

    const array: Array<number> = [1, 2, 3];
  
    it("Should map keys by a specific property function.", () => {
     
      const parityFn = (a: number): string => {return (a % 2 === 0)? "even" : "odd"; };
      let mapping: Map<string, Array<number>> = ContainerUtils.groupElementsByProperty<string>(array, parityFn);
      expect(mapping.size).toEqual(2);
      expect(mapping.has("odd")).toBeTruthy;
      expect(mapping.has("even")).toBeTruthy;
      expect(mapping.get("odd")?.length).toEqual(2);
      expect(mapping.get("even")?.length).toEqual(1);
      expect(mapping.get("odd")).toContain(1);
      expect(mapping.get("odd")).toContain(3);
      expect(mapping.get("even")).toContain(2);          
    });
  
  
  });

   
describe("Map Utils Tests", () => {

    const map: Map<number, string> = new Map<number, string>();
    map.set(2, "Mario");
    map.set(1, "Luigi");
    map.set(3, "Bowser");
  
    it("Should sort map in descending order.", () => {
     
      //ContainerUtils.sortMapDescendingByKey(map);
      const sortedMap = new Map([...map].sort((a, b) => b[0] - a[0]));
      expect(Array.from(sortedMap.keys())).toEqual([3,2,1]);
      expect(Array.from(sortedMap.values())).toEqual(["Bowser","Mario","Luigi"]);
  
    });  
  
});


