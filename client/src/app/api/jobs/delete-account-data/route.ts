import { NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { deleteAccountData } from "@/lib/account-data";

// Finishes an account deletion whose data removal failed. Throwing returns 500, so QStash retries.
async function handler(req: Request) {
  const { userId } = await req.json();

  // Only a confirmed "no such user" allows deleting. Any other lookup error must not wipe data.
  const { data, error } = await getSupabaseAdmin().auth.admin.getUserById(userId);
  if (data?.user) return NextResponse.json({ skipped: true });
  if (error?.status !== 404) throw new Error(`Could not confirm user ${userId} is gone`);

  await deleteAccountData(userId);
  return NextResponse.json({ deleted: true });
}

// Wrapped per request: building the verifier at import reads the signing keys,
// which breaks `next build` wherever they aren't set (CI, preview builds)
export const POST = (req: Request) => verifySignatureAppRouter(handler)(req);
