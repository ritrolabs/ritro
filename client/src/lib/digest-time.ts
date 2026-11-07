// Time zone math for the daily digest (docs/specs/P2.8-digest-local-time.md).
// Intl only: Temporal is not available on the Node versions Ritro runs (local 25, CI 20).

const DIGEST_HOUR = 8;

/** True when `timeZone` is a real IANA zone name that Intl can use. */
export function isValidTimeZone(timeZone: unknown): timeZone is string {
  if (typeof timeZone !== "string" || !timeZone) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

// What the wall clock reads in `timeZone` at `ms`, as numbers.
function wallClock(timeZone: string, ms: number) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).formatToParts(ms);
  const get = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute"), second: get("second") };
}

// How far `timeZone` is ahead of UTC at `ms` (negative when behind), in ms. Changes with daylight saving.
function offsetAt(timeZone: string, ms: number): number {
  const w = wallClock(timeZone, ms);
  return Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second) - Math.floor(ms / 1000) * 1000;
}

// The UTC moment when the clock in `timeZone` reads DIGEST_HOUR:00 on the given local date.
function localHourToUtc(timeZone: string, year: number, month: number, day: number): number {
  const asIfUtc = Date.UTC(year, month - 1, day, DIGEST_HOUR);
  // First guess uses the offset at that moment; recheck once in case daylight saving changed in between
  const guess = asIfUtc - offsetAt(timeZone, asIfUtc);
  return asIfUtc - offsetAt(timeZone, guess);
}

/** The UTC moment of the first 8:00 local time in `timeZone` strictly after `after`. */
export function nextLocalEight(timeZone: string, after: Date): Date {
  const today = wallClock(timeZone, after.getTime());
  for (let addDays = 0; addDays < 3; addDays++) {
    // Date.UTC rolls day 32 over into the next month, so adding days is safe here
    const d = new Date(Date.UTC(today.year, today.month - 1, today.day + addDays));
    const at = localHourToUtc(timeZone, d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
    if (at > after.getTime()) return new Date(at);
  }
  throw new Error(`no local ${DIGEST_HOUR}:00 found for ${timeZone} after ${after.toISOString()}`);
}
