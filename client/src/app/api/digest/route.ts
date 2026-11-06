import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { queueDigests } from "@/lib/digest-schedule";

// Hourly sweep (spec P2.8, section 7): find users whose local 8 am has arrived and queue one
// send-digest job each. It never sends email itself, so the run stays short however many users
// are due. A user is only marked done by the worker after their email is sent, so a crash here
// just means the next hourly run queues them again.
export const maxDuration = 60;

const PAGE = 500;
const TIME_BUDGET_MS = 45_000;

// Called hourly by a QStash schedule, and daily at 08:00 by Vercel Cron as a backup (the Hobby plan
// allows daily crons only). Both send GET with Authorization: Bearer CRON_SECRET. A second run in the
// same hour is harmless: it only queues users still due, and the worker skips anyone already sent.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("Authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const started = Date.now();
  const now = new Date();
  let queued = 0;
  let cursor: string | undefined;

  // Page by userId: queued users stay due until the worker sends, so paging by "still due"
  // alone would fetch the same 500 users forever
  while (Date.now() - started < TIME_BUDGET_MS) {
    const due = await prisma.digestSchedule.findMany({
      where: { nextDigestAt: { lte: now } },
      orderBy: { userId: "asc" },
      take: PAGE,
      select: { userId: true },
      ...(cursor ? { cursor: { userId: cursor }, skip: 1 } : {}),
    });
    if (due.length === 0) break;

    try {
      await queueDigests(due.map((d) => d.userId));
    } catch (err) {
      console.error("Digest: failed to queue a page (next run retries):", err);
      return NextResponse.json({ queued, error: "queue failed" }, { status: 500 });
    }
    queued += due.length;
    cursor = due[due.length - 1].userId;
    if (due.length < PAGE) break;
  }

  return NextResponse.json({ queued });
}
