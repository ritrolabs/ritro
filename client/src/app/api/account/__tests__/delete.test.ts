import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  deleteUser: vi.fn(),
  getUserById: vi.fn(),
  queueAccountDataDeletion: vi.fn(),
  collectionDeleteMany: vi.fn(() => "collections"),
  bookmarkDeleteMany: vi.fn(() => "bookmarks"),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: mocks.transaction,
    collection: { deleteMany: mocks.collectionDeleteMany },
    bookmark: { deleteMany: mocks.bookmarkDeleteMany },
  },
}));
vi.mock("@/lib/supabase/get-user", () => ({ getUserFromRequest: async () => ({ id: "u1" }) }));
vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: () => ({ auth: { admin: { deleteUser: mocks.deleteUser, getUserById: mocks.getUserById } } }),
}));
vi.mock("@/lib/tag-queue", () => ({ queueAccountDataDeletion: mocks.queueAccountDataDeletion }));
vi.mock("@upstash/qstash/nextjs", () => ({
  verifySignatureAppRouter: (handler: (req: Request) => Promise<Response>) => handler,
}));

import { DELETE } from "../route";
import { POST as runJob } from "../../jobs/delete-account-data/route";

const deleteAccount = () =>
  DELETE(new Request("http://localhost/api/account", {
    method: "DELETE",
    body: JSON.stringify({ confirm: "delete my account" }),
  }) as unknown as NextRequest);

const job = () =>
  runJob(new Request("http://localhost/api/jobs/delete-account-data", {
    method: "POST",
    body: JSON.stringify({ userId: "u1" }),
  }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.deleteUser.mockResolvedValue({ error: null });
  mocks.transaction.mockResolvedValue([]);
  mocks.queueAccountDataDeletion.mockResolvedValue(undefined);
});

describe("DELETE /api/account", () => {
  it("queues a retry when data removal fails after the login is gone", async () => {
    mocks.transaction.mockRejectedValue(new Error("db down"));
    const res = await deleteAccount();
    expect(mocks.queueAccountDataDeletion).toHaveBeenCalledWith("u1");
    expect(res.status).toBe(200);
  });

  it("reports the failure when the retry cannot be queued either", async () => {
    mocks.transaction.mockRejectedValue(new Error("db down"));
    mocks.queueAccountDataDeletion.mockRejectedValue(new Error("qstash down"));
    const res = await deleteAccount();
    expect(res.status).toBe(500);
  });

  it("does not queue anything when data removal works", async () => {
    await deleteAccount();
    expect(mocks.queueAccountDataDeletion).not.toHaveBeenCalled();
  });
});

describe("delete-account-data job", () => {
  it("deletes rows once the login is confirmed gone", async () => {
    mocks.getUserById.mockResolvedValue({ data: { user: null }, error: { status: 404 } });
    const res = await job();
    expect(res.status).toBe(200);
    expect(mocks.transaction).toHaveBeenCalledOnce();
  });

  it("never deletes rows for a login that still exists", async () => {
    mocks.getUserById.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    await job();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("throws on an auth lookup error so nothing is deleted and QStash retries", async () => {
    mocks.getUserById.mockResolvedValue({ data: { user: null }, error: { status: 500 } });
    await expect(job()).rejects.toThrow();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
