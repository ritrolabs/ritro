import { beforeEach, describe, expect, it, vi } from "vitest";

const { generateContent } = vi.hoisted(() => ({ generateContent: vi.fn() }));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent };
  },
}));

import { generateTags } from "../gemini";

const reply = (text: string, finishReason = "STOP") => ({ text, candidates: [{ finishReason }] });

describe("generateTags", () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = "k";
    generateContent.mockReset();
  });

  it("returns cleaned tags", async () => {
    generateContent.mockResolvedValue(reply('["React", " "]'));
    await expect(generateTags("A", null)).resolves.toEqual(["react"]);
  });

  it("treats an empty array as a real answer", async () => {
    generateContent.mockResolvedValue(reply("[]"));
    await expect(generateTags("A", null)).resolves.toEqual([]);
  });

  it("throws on malformed output so the job can retry", async () => {
    generateContent.mockResolvedValue(reply("not json"));
    await expect(generateTags("A", null)).rejects.toThrow();
  });

  it("throws when generation did not finish", async () => {
    generateContent.mockResolvedValue(reply('["a"]', "MAX_TOKENS"));
    await expect(generateTags("A", null)).rejects.toThrow();
  });
});
