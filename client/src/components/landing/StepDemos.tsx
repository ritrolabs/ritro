"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { EXAMPLES } from "./examples";

// Small demos beside "You save it" and "Ritro files it". Each plays once, slowly, when it scrolls
// into view. The CSS (globals.css, .step-demo) only animates under [data-play], so without
// JavaScript or with reduced motion the finished state shows.
function PlayOnView({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setPlay(true);
        io.disconnect();
      },
      { threshold: 0.6 },
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <figure ref={ref} data-play={play || undefined} aria-label={label} className="step-demo mt-6 max-w-md">
      {children}
      <figcaption className="mt-2 text-xs text-[var(--text-dim)]">Example.</figcaption>
    </figure>
  );
}

const SAVE = EXAMPLES[5];
const FILE = EXAMPLES[1];

export function SaveStepDemo() {
  return (
    <PlayOnView label="Example: pressing Alt+Shift+S saves the page you are on">
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {["Alt", "Shift", "S"].map((k, i) => (
          <kbd
            key={k}
            className="step-key inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-[var(--text)] px-2.5 font-data text-xs font-medium text-[var(--bg)] shadow-[0_3px_0_var(--text-muted)]"
            style={{ ["--down-at" as string]: `${0.5 + i * 0.35}s` }}
          >
            {k}
          </kbd>
        ))}
      </div>
      <div className="step-saved mt-5 flex items-center gap-2.5 rounded-md border border-[var(--border-2)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-lift)]">
        <Check size={14} aria-hidden className="shrink-0 text-[var(--accent)]" />
        <span className="text-sm text-[var(--text)]">Saved</span>
        <span className="min-w-0 truncate font-data text-xs text-[var(--text-dim)]">{SAVE.url}</span>
      </div>
    </PlayOnView>
  );
}

export function FileStepDemo() {
  return (
    <PlayOnView label="Example: a saved link gets its description, then AI tags a few seconds later">
      <div className="rounded-md border border-[var(--border-2)] bg-[var(--surface)] p-4 shadow-[var(--shadow-lift)]">
        <p className="font-data text-[11px] text-[var(--text-dim)]">{FILE.site}</p>
        <p className="mt-1 font-serif text-[17px] font-medium leading-snug text-[var(--text)]">{FILE.title}</p>
        <p className="step-desc mt-1 text-sm text-[var(--text-muted)]">{FILE.description}</p>
        {/* "Tagging…" and the tags share one grid cell, so the card never changes height */}
        <div className="mt-3 grid">
          <span className="step-tagging [grid-area:1/1] self-center text-xs text-[var(--text-dim)]">Tagging…</span>
          <div className="[grid-area:1/1] flex flex-wrap gap-1.5">
            {FILE.tags.map((tag, i) => (
              <span
                key={tag}
                className="step-tag rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs text-[var(--accent)]"
                style={{ ["--tag-at" as string]: `${3.4 + i * 0.35}s` }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </PlayOnView>
  );
}
