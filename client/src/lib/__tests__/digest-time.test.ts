import { describe, expect, it } from "vitest";
import { isValidTimeZone, nextLocalEight } from "../digest-time";

// Expected values checked against Python's zoneinfo (the same IANA database), see the spec, section 6
const cases: [zone: string, after: string, expected: string, why: string][] = [
  ["Asia/Kolkata", "2026-11-06T01:00:00Z", "2026-11-06T02:30:00.000Z", "half-hour offset, same day"],
  ["Asia/Kolkata", "2026-11-06T03:00:00Z", "2026-11-07T02:30:00.000Z", "already past 8 am, next day"],
  ["America/New_York", "2026-11-01T05:00:00Z", "2026-11-01T13:00:00.000Z", "the morning clocks fall back"],
  ["America/New_York", "2026-03-08T06:00:00Z", "2026-03-08T12:00:00.000Z", "the morning clocks spring forward"],
  ["Pacific/Kiritimati", "2026-11-06T00:00:00Z", "2026-11-06T18:00:00.000Z", "UTC+14, local date ahead of UTC"],
  ["UTC", "2026-11-06T08:00:00Z", "2026-11-07T08:00:00.000Z", "exactly 8 am counts as past"],
  // The offset at "8:00 read as UTC" differs from the offset at the real local 8:00, so one guess is wrong
  ["America/Denver", "2026-03-08T00:00:00Z", "2026-03-08T14:00:00.000Z", "spring forward between the guess and the answer"],
  ["America/Anchorage", "2026-03-08T00:00:00Z", "2026-03-08T16:00:00.000Z", "same, nine hours behind UTC"],
  ["America/Los_Angeles", "2026-12-31T20:00:00Z", "2027-01-01T16:00:00.000Z", "crosses into a new year"],
];

describe("nextLocalEight", () => {
  it.each(cases)("%s after %s is %s (%s)", (zone, after, expected) => {
    expect(nextLocalEight(zone, new Date(after)).toISOString()).toBe(expected);
  });
});

describe("isValidTimeZone", () => {
  it("accepts real IANA names", () => {
    expect(isValidTimeZone("Asia/Kolkata")).toBe(true);
    expect(isValidTimeZone("UTC")).toBe(true);
  });

  it("rejects made-up names, empty strings and non-strings", () => {
    expect(isValidTimeZone("Mars/Base")).toBe(false);
    expect(isValidTimeZone("")).toBe(false);
    expect(isValidTimeZone(undefined)).toBe(false);
    expect(isValidTimeZone(330)).toBe(false);
  });
});
