import { prisma } from "@/lib/prisma";
import { isValidTimeZone, nextLocalEight } from "@/lib/digest-time";

/**
 * Record the time zone a user's browser reported (spec P2.8, section 5).
 * - Valid and new or changed: store it and recompute the next 8 am.
 * - Valid and unchanged: nothing to write.
 * - Missing or invalid: never stored. The user still gets a schedule (08:00 UTC, today's
 *   behaviour) if they have none, so nobody drops out of the digest.
 * Never throws: the save or page load that carried the zone must not fail because of it.
 */
export async function recordTimeZone(userId: string, reported: unknown): Promise<void> {
  try {
    const now = new Date();
    if (!isValidTimeZone(reported)) {
      if (reported !== undefined) console.warn("Digest: ignoring invalid time zone", { userId, reported });
      await prisma.digestSchedule.upsert({
        where: { userId },
        create: { userId, timeZone: "UTC", nextDigestAt: nextLocalEight("UTC", now) },
        update: {},
      });
      return;
    }

    const existing = await prisma.digestSchedule.findUnique({ where: { userId }, select: { timeZone: true } });
    if (existing?.timeZone === reported) return;

    const nextDigestAt = nextLocalEight(reported, now);
    await prisma.digestSchedule.upsert({
      where: { userId },
      create: { userId, timeZone: reported, nextDigestAt },
      update: { timeZone: reported, nextDigestAt },
    });
  } catch (err) {
    console.error("Digest: failed to record time zone (non-fatal):", err);
  }
}
