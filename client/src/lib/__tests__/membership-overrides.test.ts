import { describe, expect, it } from "vitest";
import { reconcileMembershipOverrides } from "../membership-overrides";

const server = [{ id: "b1", collectionIds: ["server"] }];

describe("reconcileMembershipOverrides", () => {
  it("lets the server win once no save is in flight, even if the values differ", () => {
    const prev = new Map([["b1", ["from-other-tab"]]]);
    expect(reconcileMembershipOverrides(prev, server, new Map()).size).toBe(0);
  });

  it("keeps an override while its save is in flight", () => {
    const prev = new Map([["b1", ["optimistic"]]]);
    const next = reconcileMembershipOverrides(prev, server, new Map([["b1", 1]]));
    expect(next.get("b1")).toEqual(["optimistic"]);
  });

  it("drops an override for a bookmark that no longer exists", () => {
    const prev = new Map([["gone", ["c1"]]]);
    expect(reconcileMembershipOverrides(prev, server, new Map([["gone", 1]])).size).toBe(0);
  });

  it("returns the same map when nothing changes, so React skips the update", () => {
    const prev = new Map<string, string[]>();
    expect(reconcileMembershipOverrides(prev, server, new Map())).toBe(prev);
  });
});
