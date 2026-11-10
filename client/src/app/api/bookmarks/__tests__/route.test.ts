import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const { findFirst, create, scrapeUrl } = vi.hoisted(() => ({
  findFirst: vi.fn(),
  create: vi.fn(),
  scrapeUrl: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: { bookmark: { findFirst, create } } }));
vi.mock("@/lib/scraper", () => ({ scrapeUrl, titleFromUrl: () => "title" }));
vi.mock("@/lib/supabase/get-user", () => ({ getUserFromRequest: async () => ({ id: "user-1" }) }));
vi.mock("@/lib/ratelimit", () => ({ bookmarkRatelimit: {}, checkRatelimit: async () => ({ success: true }) }));
vi.mock("@/lib/tag-queue", () => ({ queueTagging: async () => undefined }));
vi.mock("@/lib/url-validation", () => ({ isPublicHost: async () => true }));

import { POST } from "../route";

const save = () =>
  POST(new Request("http://localhost/api/bookmarks", {
    method: "POST",
    body: JSON.stringify({ url: "https://example.com/a" }),
  }) as unknown as NextRequest);

describe("POST /api/bookmarks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    scrapeUrl.mockResolvedValue({ title: "A", description: null, thumbnail: null });
    create.mockResolvedValue({ id: "b1" });
  });

  it("returns 409 and creates nothing when the user already saved the URL", async () => {
    findFirst.mockResolvedValue({ id: "existing" });
    const res = await save();
    expect(res.status).toBe(409);
    expect(create).not.toHaveBeenCalled();
    expect(scrapeUrl).not.toHaveBeenCalled();
  });

  it("saves a URL the user has not saved", async () => {
    findFirst.mockResolvedValue(null);
    const res = await save();
    expect(res.status).toBe(201);
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1", url: "https://example.com/a" } }),
    );
  });
});
