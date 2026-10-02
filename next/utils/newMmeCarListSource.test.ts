import { describe, expect, it } from "vitest";
import { buildNewMmeCarListIds } from "./newMmeCarListSource";

describe("buildNewMmeCarListIds", () => {
  it("returns session ids for guest", () => {
    expect(buildNewMmeCarListIds(true, ["a", "b"], ["c", "d"])).toEqual(["a", "b"]);
  });

  it("returns garage ids for logged-in user", () => {
    expect(buildNewMmeCarListIds(false, ["a", "b"], ["c", "d"])).toEqual(["c", "d"]);
  });

  it("does not merge guest session with garage", () => {
    expect(buildNewMmeCarListIds(false, ["guest-only"], ["garage-1"])).toEqual(["garage-1"]);
    expect(buildNewMmeCarListIds(true, ["guest-only"], ["garage-1"])).toEqual(["guest-only"]);
  });
});
