import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase/get-user";
import { isValidTimeZone } from "@/lib/digest-time";
import { recordTimeZone } from "@/lib/digest-schedule";

// POST /api/account/timezone: the app reports the browser's time zone on load, so users who
// only read (and never save) still get their digest at 8 am local time. Spec P2.8, section 5.
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!isValidTimeZone(body?.timeZone)) {
    return NextResponse.json({ error: "invalid time zone" }, { status: 400 });
  }

  await recordTimeZone(user.id, body.timeZone);
  return new NextResponse(null, { status: 204 });
}
