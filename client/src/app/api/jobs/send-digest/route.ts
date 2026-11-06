import { NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { sendDigest } from "@/lib/digest-send";

// QStash calls this once per user the hourly sweep found due. Logic lives in lib/digest-send.ts.
// Throwing returns 500, so QStash retries.
async function handler(req: Request) {
  const { userId } = await req.json();
  return NextResponse.json(await sendDigest(userId));
}

// Wrapped per request: building the verifier at import reads the signing keys,
// which breaks `next build` wherever they aren't set (CI, preview builds)
export const POST = (req: Request) => verifySignatureAppRouter(handler)(req);
