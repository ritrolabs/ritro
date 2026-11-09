type ServerBookmark = { id: string; collectionIds: string[] };

// Fresh server data replaces every override except those with a save still in flight
export function reconcileMembershipOverrides(
  prev: Map<string, string[]>,
  bookmarks: ServerBookmark[],
  pending: ReadonlyMap<string, number>,
) {
  const ids = new Set(bookmarks.map((b) => b.id));
  const next = new Map([...prev].filter(([id]) => ids.has(id) && pending.has(id)));
  return next.size === prev.size ? prev : next;
}
