import { prisma } from "@/lib/prisma";

// Tags and collection links are removed by the schema's cascading deletes
export function deleteAccountData(userId: string) {
  return prisma.$transaction([
    prisma.collection.deleteMany({ where: { userId } }),
    prisma.bookmark.deleteMany({ where: { userId } }),
  ]);
}
