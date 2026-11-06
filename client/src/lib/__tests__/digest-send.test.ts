import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  findUnique: vi.fn(),
  update: vi.fn(),
  deleteMany: vi.fn(),
  count: vi.fn(),
  findMany: vi.fn(),
  getUserById: vi.fn(),
  send: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    digestSchedule: { findUnique: m.findUnique, update: m.update, deleteMany: m.deleteMany },
    bookmark: { count: m.count, findMany: m.findMany },
  },
}));
vi.mock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => ({ auth: { admin: { getUserById: m.getUserById } } }) }));
vi.mock("resend", () => ({ Resend: class { emails = { send: m.send }; } }));
vi.mock("@/lib/digest-email", () => ({ buildDigestHtml: (_b: unknown, _e: string, note?: string) => `html ${note ?? ""}` }));

import { sendDigest } from "../digest-send";

// 02:40 UTC on 6 Nov is 08:10 in India, just after their 8 am
const NOW = new Date("2026-11-06T02:40:00Z");
const DUE = new Date("2026-11-06T02:30:00Z");
const NEXT_INDIA = "2026-11-07T02:30:00.000Z";

function schedule(over: Record<string, unknown> = {}) {
  return { userId: "u1", timeZone: "Asia/Kolkata", nextDigestAt: DUE, lastSentAt: null, ...over };
}

beforeEach(() => {
  vi.clearAllMocks();
  m.findUnique.mockResolvedValue(schedule());
  m.getUserById.mockResolvedValue({ data: { user: { email: "a@b.c", user_metadata: {} } }, error: null });
  m.count.mockResolvedValue(3);
  m.findMany.mockResolvedValue([{ url: "https://x.com", title: "x", description: null, tags: [] }]);
  m.send.mockResolvedValue({ data: { id: "e1" }, error: null });
});

describe("sendDigest", () => {
  it("sends, then moves the schedule to the next local 8 am", async () => {
    expect(await sendDigest("u1", NOW)).toEqual({ sent: true });
    const [email, opts] = m.send.mock.calls[0];
    expect(email.subject).toBe("Good morning. Here's your Ritro digest.");
    expect(opts.idempotencyKey).toBe("digest-u1-2026-11-06"); // the local date in India
    const data = m.update.mock.calls[0][0].data;
    expect(data.lastSentAt).toBe(NOW);
    expect(data.nextDigestAt.toISOString()).toBe(NEXT_INDIA);
  });

  it("does not move the schedule when the send fails, so it is retried", async () => {
    m.send.mockResolvedValue({ data: null, error: { message: "rate limited" } });
    await expect(sendDigest("u1", NOW)).rejects.toThrow("rate limited");
    expect(m.update).not.toHaveBeenCalled();
  });

  it("skips a repeat delivery once the schedule has moved on", async () => {
    m.findUnique.mockResolvedValue(schedule({ nextDigestAt: new Date(NEXT_INDIA) }));
    expect(await sendDigest("u1", NOW)).toEqual({ skipped: "not due" });
    expect(m.send).not.toHaveBeenCalled();
  });

  it("sends one digest per real day when travel brings 8 am round again", async () => {
    m.findUnique.mockResolvedValue(schedule({ lastSentAt: new Date("2026-11-05T20:00:00Z") }));
    expect(await sendDigest("u1", NOW)).toEqual({ skipped: "sent recently" });
    expect(m.send).not.toHaveBeenCalled();
    expect(m.update).toHaveBeenCalledOnce();
  });

  it("skips opted-out users but moves them to tomorrow", async () => {
    m.getUserById.mockResolvedValue({ data: { user: { email: "a@b.c", user_metadata: { digest_opt_out: true } } }, error: null });
    expect(await sendDigest("u1", NOW)).toEqual({ skipped: "no email or opted out" });
    expect(m.send).not.toHaveBeenCalled();
    expect(m.update.mock.calls[0][0].data.nextDigestAt.toISOString()).toBe(NEXT_INDIA);
  });

  it("uses the neutral subject and a hint while the zone is still UTC", async () => {
    m.findUnique.mockResolvedValue(schedule({ timeZone: "UTC", nextDigestAt: new Date("2026-11-06T08:00:00Z") }));
    await sendDigest("u1", new Date("2026-11-06T08:10:00Z"));
    const [email] = m.send.mock.calls[0];
    expect(email.subject).toMatch(/^Your Ritro digest: 1 save worth another look$/);
    expect(email.html).toContain("8 am your time");
  });

  it("counts a refused retry with a different payload as already sent, and moves on", async () => {
    m.send.mockResolvedValue({ data: null, error: { name: "invalid_idempotent_request", message: "different payload" } });
    expect(await sendDigest("u1", NOW)).toEqual({ skipped: "already sent" });
    expect(m.update.mock.calls[0][0].data.nextDigestAt.toISOString()).toBe(NEXT_INDIA);
  });

  it("removes the schedule of a deleted account instead of failing every hour", async () => {
    m.getUserById.mockResolvedValue({ data: { user: null }, error: { code: "user_not_found", message: "User not found" } });
    expect(await sendDigest("u1", NOW)).toEqual({ skipped: "user gone" });
    expect(m.deleteMany).toHaveBeenCalledWith({ where: { userId: "u1" } });
    expect(m.send).not.toHaveBeenCalled();
  });

  it("still throws on other user lookup errors, so QStash retries", async () => {
    m.getUserById.mockResolvedValue({ data: { user: null }, error: { code: "unexpected_failure", message: "boom" } });
    await expect(sendDigest("u1", NOW)).rejects.toThrow("boom");
    expect(m.deleteMany).not.toHaveBeenCalled();
  });

  it("skips a user with no bookmarks but moves them to tomorrow", async () => {
    m.count.mockResolvedValue(0);
    expect(await sendDigest("u1", NOW)).toEqual({ skipped: "no bookmarks" });
    expect(m.send).not.toHaveBeenCalled();
    expect(m.update.mock.calls[0][0].data.nextDigestAt.toISOString()).toBe(NEXT_INDIA);
  });

  it("does nothing when the schedule row is already gone", async () => {
    m.findUnique.mockResolvedValue(null);
    expect(await sendDigest("u1", NOW)).toEqual({ skipped: "not due" });
    expect(m.getUserById).not.toHaveBeenCalled();
    expect(m.send).not.toHaveBeenCalled();
    expect(m.update).not.toHaveBeenCalled();
  });
});
