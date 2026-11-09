import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const { findUnique, findMany, updateMany, update, createMany, generateTags, queueTaggingBatch } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  findMany: vi.fn(),
  updateMany: vi.fn(),
  update: vi.fn((args) => ({ op: "update", args })),
  createMany: vi.fn((args) => ({ op: "createMany", args })),
  generateTags: vi.fn(),
  queueTaggingBatch: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    bookmark: { findUnique, findMany, updateMany, update },
    tag: { createMany },
    $transaction: vi.fn(async (ops) => ops),
  },
}));
vi.mock("@/lib/gemini", () => ({ generateTags }));
vi.mock("@/lib/tag-queue", () => ({ queueTaggingBatch }));
vi.mock("@upstash/qstash/nextjs", () => ({
  verifySignatureAppRouter: (handler: (req: Request) => Promise<Response>) => handler,
}));

import { POST as tagBookmark } from "../tag-bookmark/route";
import { GET as requeue } from "../requeue-untagged/route";

const runJob = () =>
  tagBookmark(new Request("http://localhost/api/jobs/tag-bookmark", {
    method: "POST",
    body: JSON.stringify({ bookmarkId: "b1" }),
  }));

const pending = { id: "b1", title: "A", description: null, taggingStatus: "pending" };

describe("tag-bookmark job", () => {
  beforeEach(() => vi.clearAllMocks());

  it("skips a bookmark that has left pending, so removed tags stay removed", async () => {
    findUnique.mockResolvedValue({ ...pending, taggingStatus: "tagged" });
    await runJob();
    expect(generateTags).not.toHaveBeenCalled();
  });

  it("still tags a pending bookmark the user added a manual tag to", async () => {
    findUnique.mockResolvedValue(pending);
    generateTags.mockResolvedValue(["react"]);
    await runJob();
    expect(createMany).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledWith({ where: { id: "b1" }, data: { taggingStatus: "tagged" } });
  });

  it("records empty when the model has no tags to offer", async () => {
    findUnique.mockResolvedValue(pending);
    generateTags.mockResolvedValue([]);
    await runJob();
    expect(createMany).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith({ where: { id: "b1" }, data: { taggingStatus: "empty" } });
  });

  it("lets a Gemini failure reach QStash and stays pending", async () => {
    findUnique.mockResolvedValue(pending);
    generateTags.mockRejectedValue(new Error("bad response"));
    await expect(runJob()).rejects.toThrow("bad response");
    expect(update).not.toHaveBeenCalled();
  });
});

describe("requeue-untagged cron", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "s";
    findMany.mockResolvedValue([]);
    updateMany.mockResolvedValue({ count: 0 });
  });

  it("selects by status, never by tag count, and fails jobs past the retry window", async () => {
    await requeue(new Request("http://localhost/api/jobs/requeue-untagged", {
      headers: { Authorization: "Bearer s" },
    }) as unknown as NextRequest);

    const where = findMany.mock.calls[0][0].where;
    expect(where.taggingStatus).toBe("pending");
    expect(where.tags).toBeUndefined();
    expect(updateMany.mock.calls[0][0].data).toEqual({ taggingStatus: "failed" });
    expect(updateMany.mock.calls[0][0].where.taggingStatus).toBe("pending");
  });
});
