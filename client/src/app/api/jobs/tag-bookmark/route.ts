import { NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { prisma } from "@/lib/prisma";
import { generateTags } from "@/lib/gemini";

// QStash calls this after a bookmark is saved. Throwing returns 500, so QStash retries.
async function handler(req: Request) {
  const { bookmarkId } = await req.json();

  const bookmark = await prisma.bookmark.findUnique({ where: { id: bookmarkId } });
  // Deleted before the job ran: nothing to tag, and a retry won't change that
  if (!bookmark) return NextResponse.json({ skipped: true });
  // Only pending bookmarks get tagged, so a repeat delivery can't pay for Gemini twice
  // and tags the user removed don't come back
  if (bookmark.taggingStatus !== "pending") return NextResponse.json({ skipped: true });

  const tagNames = await generateTags(bookmark.title, bookmark.description);

  // Only one delivery can move this row out of pending, and only that one adds tags
  await prisma.$transaction(async (tx) => {
    const { count } = await tx.bookmark.updateMany({
      where: { id: bookmarkId, taggingStatus: "pending" },
      data: { taggingStatus: tagNames.length > 0 ? "tagged" : "empty" },
    });
    if (count === 1 && tagNames.length > 0) {
      await tx.tag.createMany({
        data: tagNames.map((name) => ({ name, bookmarkId })),
        skipDuplicates: true,
      });
    }
  });

  return NextResponse.json({ tags: tagNames.length });
}

// Wrapped per request: building the verifier at import reads the signing keys,
// which breaks `next build` wherever they aren't set (CI, preview builds)
export const POST = (req: Request) => verifySignatureAppRouter(handler)(req);
