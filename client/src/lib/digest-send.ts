import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { nextLocalEight } from "@/lib/digest-time";
import { buildDigestHtml } from "@/lib/digest-email";

export type SendResult = { sent: true } | { skipped: string };

// Sends one user's digest (spec P2.8, sections 7 and 8). QStash calls it for each user the hourly
// sweep found due. Throwing returns 500, so QStash retries. The rule: move nextDigestAt forward
// only after the email is sent, and make the send safe to repeat (Resend idempotency key).
const TRAVEL_GUARD_MS = 20 * 60 * 60 * 1000;

// "2026-11-06" as the calendar reads in that zone (en-CA formats dates as YYYY-MM-DD)
function localDate(timeZone: string, at: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(at);
}

export async function sendDigest(userId: string, now = new Date()): Promise<SendResult> {
  const schedule = await prisma.digestSchedule.findUnique({ where: { userId } });
  // Gone (account deleted) or no longer due (an earlier delivery of this job already sent it)
  if (!schedule || schedule.nextDigestAt > now) return { skipped: "not due" };

  const moveToNextDay = () =>
    prisma.digestSchedule.update({ where: { userId }, data: { nextDigestAt: nextLocalEight(schedule.timeZone, now) } });

  // Travelled west after today's digest, so 8 am came round again: one digest per real day
  if (schedule.lastSentAt && now.getTime() - schedule.lastSentAt.getTime() < TRAVEL_GUARD_MS) {
    await moveToNextDay();
    return { skipped: "sent recently" };
  }

  const { data, error } = await getSupabaseAdmin().auth.admin.getUserById(userId);
  if (error || !data.user) throw new Error(`Digest: could not load user ${userId}: ${error?.message ?? "missing"}`);
  const user = data.user;

  // Skipped users also move to tomorrow, so the sweep doesn't pick them up again every hour
  if (!user.email || user.user_metadata?.digest_opt_out === true) {
    await moveToNextDay();
    return { skipped: "no email or opted out" };
  }

  const count = await prisma.bookmark.count({ where: { userId } });
  if (count === 0) {
    await moveToNextDay();
    return { skipped: "no bookmarks" };
  }

  const take = Math.min(5, count);
  const skip = count <= 5 ? 0 : Math.floor(Math.random() * (count - take + 1));
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    skip,
    take,
    include: { tags: true },
  });

  // "UTC" means the browser hasn't reported a zone yet, so we can't promise it's morning there
  const zoneKnown = schedule.timeZone !== "UTC";
  const result = await new Resend(process.env.RESEND_API_KEY).emails.send(
    {
      from: "Ritro <onboarding@resend.dev>",
      to: user.email,
      subject: zoneKnown
        ? "Good morning. Here's your Ritro digest."
        : `Your Ritro digest: ${bookmarks.length} ${bookmarks.length === 1 ? "save" : "saves"} worth another look`,
      html: buildDigestHtml(
        bookmarks,
        user.email,
        zoneKnown ? undefined : "Open Ritro once and we'll send this at 8 am your time.",
      ),
    },
    // Per user per local day: a repeat within 24 hours is dropped by Resend, so retries never double send
    { idempotencyKey: `digest-${userId}-${localDate(schedule.timeZone, now)}` },
  );
  if (result.error) throw new Error(`Digest: Resend error for ${userId}: ${result.error.message}`);

  await prisma.digestSchedule.update({
    where: { userId },
    data: { lastSentAt: now, nextDigestAt: nextLocalEight(schedule.timeZone, now) },
  });
  return { sent: true };
}
