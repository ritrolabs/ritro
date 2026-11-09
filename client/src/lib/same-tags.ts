type TagRef = { id: string };

// Compares by id and ignores order: the bookmarks query doesn't sort tags
export function sameTags(a: TagRef[], b: TagRef[]) {
  return a.length === b.length && a.every((tag) => b.some((other) => other.id === tag.id));
}

// Every tag in `tags` exists in `server`; `server` may also have newer tags
export function allTagsSaved(tags: TagRef[], server: TagRef[]) {
  return tags.every((tag) => server.some((other) => other.id === tag.id));
}
