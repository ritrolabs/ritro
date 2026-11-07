-- P2.8 backfill: one DigestSchedule row per existing user who has bookmarks.
-- Run once in the Supabase SQL editor, after `npx prisma db push` has created the table.
-- Zone starts as UTC (today's behaviour: 08:00 UTC) until the user's browser reports a real one.
-- Safe to run twice: users who already have a row are left alone.
INSERT INTO "DigestSchedule" ("userId", "timeZone", "nextDigestAt")
SELECT DISTINCT
  "userId",
  'UTC',
  -- next 08:00 UTC: today's if it is still ahead, otherwise tomorrow's
  CASE
    WHEN date_trunc('day', now() AT TIME ZONE 'UTC') + interval '8 hours' > now() AT TIME ZONE 'UTC'
      THEN date_trunc('day', now() AT TIME ZONE 'UTC') + interval '8 hours'
    ELSE date_trunc('day', now() AT TIME ZONE 'UTC') + interval '32 hours'
  END
FROM "Bookmark"
ON CONFLICT ("userId") DO NOTHING;
