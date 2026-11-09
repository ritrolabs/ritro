import { describe, expect, it } from "vitest";
import { allTagsSaved, sameTags } from "../same-tags";

describe("sameTags", () => {
  it("matches the same ids in any order", () => {
    expect(sameTags([{ id: "a" }, { id: "b" }], [{ id: "b" }, { id: "a" }])).toBe(true);
  });

  it("detects tags arriving on a card that had none", () => {
    expect(sameTags([{ id: "a" }], [])).toBe(false);
  });

  it("detects a temp tag being replaced by its saved id", () => {
    expect(sameTags([{ id: "temp-1" }], [{ id: "real-1" }])).toBe(false);
  });
});

describe("allTagsSaved", () => {
  it("is true when the server has the local tags plus newer AI tags", () => {
    expect(allTagsSaved([{ id: "manual" }], [{ id: "manual" }, { id: "ai" }])).toBe(true);
  });

  it("is false while a new tag is still unsaved", () => {
    expect(allTagsSaved([{ id: "temp-1" }], [{ id: "ai" }])).toBe(false);
  });
});
