import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ findUnique: vi.fn(), upsert: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { digestSchedule: db } }));

import { recordTimeZone } from "../digest-schedule";

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("recordTimeZone", () => {
  it("stores a new valid zone with its next 8 am", async () => {
    db.findUnique.mockResolvedValue(null);
    await recordTimeZone("u1", "Asia/Kolkata");
    const arg = db.upsert.mock.calls[0][0];
    expect(arg.create.timeZone).toBe("Asia/Kolkata");
    expect(arg.update.timeZone).toBe("Asia/Kolkata");
    expect(arg.create.nextDigestAt.toISOString()).toMatch(/T02:30:00\.000Z$/);
  });

  it("writes nothing when the zone has not changed", async () => {
    db.findUnique.mockResolvedValue({ timeZone: "Asia/Kolkata" });
    await recordTimeZone("u1", "Asia/Kolkata");
    expect(db.upsert).not.toHaveBeenCalled();
  });

  it("never stores an invalid zone, but makes sure the user has a UTC schedule", async () => {
    await recordTimeZone("u1", "Mars/Base");
    const arg = db.upsert.mock.calls[0][0];
    expect(arg.create.timeZone).toBe("UTC");
    expect(arg.update).toEqual({}); // an existing real zone is left alone
  });

  it("treats a missing zone (old extension) the same way", async () => {
    await recordTimeZone("u1", undefined);
    expect(db.upsert.mock.calls[0][0].create.timeZone).toBe("UTC");
  });

  it("never throws, so the save that carried the zone cannot fail", async () => {
    db.findUnique.mockRejectedValue(new Error("db down"));
    await expect(recordTimeZone("u1", "Asia/Kolkata")).resolves.toBeUndefined();
  });
});
