import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage, GITHUB_URL } from "@/components/site/SiteChrome";

export const metadata: Metadata = {
  title: "Compare | Ritro",
  description:
    "Ritro next to Raindrop.io, Readwise Reader, Instapaper and Matter. Each comparison says plainly where the other app is better, and every fact links to its source.",
};

// Every fact here comes from docs/compare/evidence.md, with its source and the date it was checked.
// A fact without a source does not go on this page; "Not stated" means the app's own pages didn't say.
const CHECKED = "6 November 2026";

type Fact = { text: string; href?: string };
const NOT_STATED: Fact = { text: "Not stated" };

const COLUMNS = ["Free plan", "Paid plan", "Apps", "Brings back", "AI tags", "Import", "Highlights", "Source code"] as const;

const APPS: { name: string; kind: string; verdict: string; facts: Fact[] }[] = [
  {
    name: "Ritro",
    kind: "This site",
    verdict: "",
    facts: [
      { text: "Free, no paid plan", href: `${GITHUB_URL}/blob/main/client/PRODUCT.md` },
      { text: "None" },
      { text: "Web, Chrome extension (installed from source), bookmarklet", href: "/extension" },
      { text: "Surprise me pulls out a forgotten save", href: `${GITHUB_URL}/tree/main/client/src/app/api/bookmarks/random` },
      { text: "Yes, on every save, free", href: `${GITHUB_URL}/blob/main/client/src/lib/gemini.ts` },
      { text: "No" },
      { text: "No" },
      { text: "Public, AGPL‑3.0", href: `${GITHUB_URL}/blob/main/LICENSE` },
    ],
  },
  {
    name: "Raindrop.io",
    kind: "Bookmark manager",
    verdict: "Raindrop does more today: mobile apps, highlights and import from other apps. Ritro tags every save with AI for free, where Raindrop's AI is part of Pro.",
    facts: [
      { text: "Yes, unlimited bookmarks", href: "https://help.raindrop.io/limitations" },
      { text: "Pro ₹3,104.08 a year inc. VAT (shown in India)", href: "https://raindrop.io/pro/buy" },
      { text: "Web, iOS, Android, Mac; Chrome, Safari, Firefox, Edge", href: "https://raindrop.io/download" },
      { text: "Reminders (Pro)", href: "https://help.raindrop.io/limitations" },
      { text: "AI Suggestions (Pro)", href: "https://raindrop.io/pro/buy" },
      { text: "Yes, including Pocket and Instapaper", href: "https://help.raindrop.io/import" },
      { text: "Yes, free", href: "https://raindrop.io/pro/buy" },
      { text: "Web app and extensions public, MIT", href: "https://github.com/raindropio/app" },
    ],
  },
  {
    name: "Readwise Reader",
    kind: "Reading app",
    verdict: "Reader is the stronger reading app, with highlights, mobile apps and a Daily Digest of saved documents. Ritro is free and open source; Reader is paid after a 30 day trial.",
    facts: [
      { text: "No, 30 day free trial", href: "https://readwise.io/read" },
      { text: "From $7.99 a month, billed yearly", href: "https://readwise.io/pricing/reader" },
      { text: "Web, iOS, Android; Chrome, Firefox, Safari", href: "https://docs.readwise.io/reader/docs/faqs" },
      { text: "Daily Digest of saved documents", href: "https://docs.readwise.io/reader/docs/faqs/daily-digest" },
      { text: "Optional auto-tagging prompt", href: "https://docs.readwise.io/reader/docs/faqs/ghostreader" },
      { text: "Instapaper, Pocket export file", href: "https://readwise.io/read" },
      { text: "Yes", href: "https://readwise.io/read" },
      NOT_STATED,
    ],
  },
  {
    name: "Instapaper",
    kind: "Read later app",
    verdict: "Instapaper has mobile apps and a reading view with highlights. Ritro adds free AI tags and Surprise me, and its code is public.",
    facts: [
      { text: "Yes, unlimited saves", href: "https://www.instapaper.com/premium" },
      { text: "$5.99 a month or $59.99 a year", href: "https://www.instapaper.com/premium" },
      { text: "Web, iOS, Android", href: "https://www.instapaper.com/premium" },
      NOT_STATED,
      NOT_STATED,
      NOT_STATED,
      { text: "Yes; 5 notes a month on the free plan", href: "https://www.instapaper.com/premium" },
      NOT_STATED,
    ],
  },
  {
    name: "Matter",
    kind: "Read later app",
    verdict: "Matter is built for reading on iPhone and iPad, with highlights and an AI co-reader. Ritro is web first, free and open source.",
    facts: [
      { text: "Yes, unlimited library", href: "https://apps.apple.com/us/app/matter-reading-app/id1501592184" },
      { text: "Several prices listed on the App Store", href: "https://apps.apple.com/us/app/matter-reading-app/id1501592184" },
      { text: "iPhone, iPad, web", href: "https://www.getmatter.com/" },
      NOT_STATED,
      { text: "AI co-reader (Premium); auto-tagging not stated", href: "https://apps.apple.com/us/app/matter-reading-app/id1501592184" },
      NOT_STATED,
      { text: "Yes", href: "https://apps.apple.com/us/app/matter-reading-app/id1501592184" },
      NOT_STATED,
    ],
  },
];

const linkClass = "underline decoration-[var(--border-2)] underline-offset-4 hover:text-[var(--accent)] hover:decoration-[var(--accent)]";

function FactCell({ fact }: { fact: Fact }) {
  if (!fact.href) return <span className={fact === NOT_STATED ? "text-[var(--text-dim)]" : undefined}>{fact.text}</span>;
  const external = fact.href.startsWith("http");
  return external ? (
    <a href={fact.href} className={linkClass} rel="noopener noreferrer">
      {fact.text}
    </a>
  ) : (
    <Link href={fact.href} className={linkClass}>
      {fact.text}
    </Link>
  );
}

export default function ComparePage() {
  return (
    <ContentPage
      title="Ritro next to four other bookmark apps."
      lead="Each comparison says plainly where the other app is better. Every fact links to where we found it."
    >
      <p className="animate-fade-up mt-8 max-w-2xl rounded-md border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-[15px] leading-relaxed text-[var(--text-muted)]" style={{ animationDelay: "200ms" }}>
        <strong className="font-medium text-[var(--text)]">Ritro is a work in progress,</strong> built and run by one
        person. Today it does less than most apps on this page. It is free, its code is public, and it is built
        around bringing your saves back.
      </p>

      <ul className="mt-16 border-t border-[var(--border)]">
        {APPS.filter((a) => a.verdict).map((app) => (
          <li key={app.name} className="reveal grid gap-2 border-b border-[var(--border)] py-7 md:grid-cols-12 md:gap-10">
            <div className="md:col-span-4">
              <h2 className="font-serif text-2xl font-medium text-[var(--text)]">{app.name}</h2>
              <p className="mt-1 text-sm text-[var(--text-dim)]">{app.kind}</p>
            </div>
            <p className="max-w-[60ch] text-[16px] leading-relaxed text-[var(--text-muted)] md:col-span-8">{app.verdict}</p>
          </li>
        ))}
        <li className="reveal grid gap-2 border-b border-[var(--border)] py-7 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-4">
            <h2 className="font-serif text-2xl font-medium text-[var(--text)]">Pocket</h2>
            <p className="mt-1 text-sm text-[var(--text-dim)]">Shut down</p>
          </div>
          <p className="max-w-[60ch] text-[16px] leading-relaxed text-[var(--text-muted)] md:col-span-8">
            Mozilla{" "}
            <a href="https://blog.mozilla.org/en/mozilla/building-whats-next/" className={linkClass} rel="noopener noreferrer">
              shut Pocket down on 8 July 2025
            </a>
            , and exports closed on 8 October 2025. If you kept your export, Raindrop and Readwise Reader can import
            it. Ritro can&apos;t import yet.
          </p>
        </li>
      </ul>

      <section className="mt-24">
        <h2 className="reveal max-w-2xl font-serif text-[clamp(2rem,4vw,3rem)] font-medium leading-tight tracking-[-0.02em]">
          The facts, side by side.
        </h2>
        <div className="reveal mt-10 overflow-x-auto rounded-md border border-[var(--border)]">
          <table className="w-full min-w-[1120px] lg:min-w-0 border-collapse text-left text-sm">
            <caption className="sr-only">Ritro compared with Raindrop.io, Readwise Reader, Instapaper and Matter</caption>
            <thead className="bg-[var(--surface-2)] text-[var(--text-muted)]">
              <tr>
                <th scope="col" className="sticky left-0 whitespace-nowrap bg-[var(--surface-2)] px-3 py-3 font-medium">App</th>
                {COLUMNS.map((c) => (
                  <th key={c} scope="col" className="whitespace-nowrap px-3 py-3 font-medium">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {APPS.map((app) => (
                <tr key={app.name} className={`border-t border-[var(--border)] align-top ${app.name === "Ritro" ? "bg-[var(--surface)]" : ""}`}>
                  <th scope="row" className={`sticky left-0 px-3 py-4 font-serif text-base font-medium text-[var(--text)] ${app.name === "Ritro" ? "bg-[var(--surface)]" : "bg-[var(--bg)]"}`}>{app.name}</th>
                  {app.facts.map((fact, i) => (
                    <td key={COLUMNS[i]} className="px-3 py-4 leading-relaxed text-[var(--text-muted)]">
                      <FactCell fact={fact} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-3xl text-xs leading-relaxed text-[var(--text-dim)]">
          Facts checked {CHECKED} on each app&apos;s own website or App Store listing. Prices change with region and
          plan; follow the link for the current one. &quot;Not stated&quot; means the app&apos;s own pages didn&apos;t say.
        </p>
      </section>

      <section className="mt-24 max-w-2xl border-t border-[var(--border)] pt-8 text-sm leading-relaxed text-[var(--text-muted)]">
        <p>
          Ritro is not affiliated with any app on this page. Their names belong to their owners. Spotted a fact that is
          wrong or out of date?{" "}
          <Link href="/contact" className="text-[var(--accent)] underline underline-offset-2">
            Tell me
          </Link>{" "}
          and I&apos;ll fix it.
        </p>
      </section>
    </ContentPage>
  );
}
