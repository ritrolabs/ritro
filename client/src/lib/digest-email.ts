import { unsubscribeToken } from "@/lib/unsubscribe-token";
import { escapeHtml } from "@/lib/html-escape";

// The digest email's HTML, shared by the send-digest worker.
export type BookmarkWithTags = {
  url: string;
  title: string | null;
  description: string | null;
  tags: Array<{ name: string }>;
};

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function buildBookmarkCard(bookmark: BookmarkWithTags, isLast: boolean): string {
  const hostname = safeHostname(bookmark.url);
  const initial = hostname.charAt(0).toUpperCase();
  const title = bookmark.title ? escapeHtml(bookmark.title) : escapeHtml(hostname);
  const description = bookmark.description
    ? escapeHtml(
        bookmark.description.length > 120
          ? bookmark.description.slice(0, 120) + "…"
          : bookmark.description
      )
    : "";

  const tagsHtml =
    bookmark.tags.length > 0
      ? `<div style="margin-top:10px;">${bookmark.tags
          .map(
            (t) =>
              `<span style="display:inline-block;font-size:11px;font-weight:500;color:#6d28d9;background:#ede9fe;border-radius:20px;padding:3px 10px;margin-right:5px;margin-bottom:4px;">${escapeHtml(t.name)}</span>`
          )
          .join("")}</div>`
      : "";

  return `
    <div style="padding:20px 0;${isLast ? "" : "border-bottom:1px solid #f0f0f0;"}">
      <div style="margin-bottom:8px;">
        <span style="display:inline-block;width:28px;height:28px;background:#ede9fe;color:#6d28d9;font-size:12px;font-weight:700;border-radius:7px;text-align:center;line-height:28px;margin-right:8px;vertical-align:middle;">${initial}</span>
        <span style="font-size:12px;color:#9ca3af;vertical-align:middle;">${escapeHtml(hostname)}</span>
      </div>
      <a href="${escapeHtml(bookmark.url)}" style="font-size:15px;font-weight:600;color:#111827;text-decoration:none;line-height:1.4;display:block;">${title}</a>
      ${description ? `<p style="font-size:13px;color:#6b7280;margin:6px 0 0;line-height:1.6;">${description}</p>` : ""}
      ${tagsHtml}
    </div>`;
}

// `note` is an optional extra line under the intro (plain text, escaped here)
export function buildDigestHtml(bookmarks: BookmarkWithTags[], email: string, note?: string): string {
  const unsubscribeUrl = `https://ritro.vercel.app/api/unsubscribe?token=${unsubscribeToken(email)}&email=${encodeURIComponent(email)}`;
  const cards = bookmarks
    .map((b, i) => buildBookmarkCard(b, i === bookmarks.length - 1))
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Your Ritro digest</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

        <!-- HEADER -->
        <tr><td style="background:#0f0f0f;border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
          <div style="font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
            ritro<span style="color:#F0A500;">.</span>
          </div>
          <div style="font-size:11px;color:#666;margin-top:6px;letter-spacing:1.5px;text-transform:uppercase;">
            Your daily digest
          </div>
        </td></tr>

        <!-- BODY -->
        <tr><td style="background:#ffffff;padding:32px 32px 24px;">
          <p style="font-size:20px;font-weight:700;color:#0f0f0f;margin:0 0 6px;letter-spacing:-0.3px;">Hey &#x1F44B;</p>
          <p style="font-size:14px;color:#6b7280;margin:0 0 28px;line-height:1.6;">
            ${bookmarks.length === 1 ? "Here is 1 thing you saved." : `Here are ${bookmarks.length} things you saved.`} Worth another look.
          </p>
          ${note ? `<p style="font-size:13px;color:#9ca3af;margin:-20px 0 28px;line-height:1.6;">${escapeHtml(note)}</p>` : ""}

          <!-- BOOKMARKS -->
          ${cards}

          <!-- CTA -->
          <div style="text-align:center;margin-top:32px;">
            <a href="https://ritro.vercel.app/app" style="display:inline-block;background:#F0A500;color:#0f0f0f;font-size:14px;font-weight:700;text-decoration:none;padding:13px 32px;border-radius:10px;letter-spacing:0.1px;">
              Open Ritro &rarr;
            </a>
          </div>
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="background:#0f0f0f;border-radius:0 0 16px 16px;padding:24px 32px;text-align:center;">
          <div style="font-size:15px;font-weight:700;color:#ffffff;margin-bottom:8px;letter-spacing:-0.3px;">
            ritro<span style="color:#F0A500;">.</span>
          </div>
          <p style="font-size:12px;color:#555;margin:0;line-height:1.7;">
            You&#39;re receiving this because you use
            <a href="https://ritro.vercel.app" style="color:#F0A500;text-decoration:none;">Ritro</a>.<br />
            The internet gave it to you once. Ritro gives it back.<br /><br />
            <a href="${unsubscribeUrl}" style="color:#555;text-decoration:underline;font-size:11px;">Unsubscribe</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
