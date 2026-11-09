type TagRef = { id: string };

// Compares by id and ignores order: the bookmarks query doesn't sort tags
export function sameTags(a: TagRef[], b: TagRef[]) {
  return a.length === b.length && a.every((tag) => b.some((other) => other.id === tag.id));
}
