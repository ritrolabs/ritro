"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useSyncExternalStore } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
const KEY = "ritro-analytics";
const EVENT = "ritro-analytics-change";

type Choice = "granted" | "denied" | null;

function readChoice(): Choice {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    // Storage blocked: treat as declined so the banner doesn't reappear on every page
    return "denied";
  }
}

// If storage is blocked the stored choice doesn't change, so nothing reloads or clears
function setChoice(choice: Choice) {
  try {
    if (choice) localStorage.setItem(KEY, choice);
    else localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

// Clarity's revocation call erases its cookies; GA has no API for that, so expire _ga cookies directly
function clearAnalytics() {
  (window as unknown as { clarity?: (...args: unknown[]) => void }).clarity?.("consent", false);
  const names = document.cookie
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter((n) => n === "_ga" || n.startsWith("_ga_"));
  // GA may set cookies on a parent domain (www.example.com -> example.com), so try every suffix
  const parts = location.hostname.split(".");
  const domains = [""];
  for (let i = 0; i < parts.length - 1; i++) {
    const host = parts.slice(i).join(".");
    domains.push(`; domain=${host}`, `; domain=.${host}`);
  }
  for (const name of names) {
    for (const domain of domains) document.cookie = `${name}=; Max-Age=0; path=/${domain}`;
  }
}

// Set once this page has loaded the scripts; they can't be unloaded, so withdrawal reloads the page
let scriptsLoaded = false;

function useChoice() {
  // "unknown" on the server and during hydration: render nothing and clear nothing until storage is read
  return useSyncExternalStore<Choice | "unknown">(subscribe, readChoice, () => "unknown");
}

// Google Analytics and Microsoft Clarity set cookies, so neither loads until the visitor accepts
export default function AnalyticsConsent() {
  const choice = useChoice();

  // Runs in every open tab: the storage event carries a withdrawal made in another tab
  useEffect(() => {
    if (choice === "unknown") return;
    if (choice === "granted") {
      scriptsLoaded = true;
      return;
    }
    // Also on every load without consent: a closing tab's GA can rewrite a cookie after it was cleared
    clearAnalytics();
    if (scriptsLoaded) window.location.reload();
  }, [choice]);

  if (!GA_ID && !CLARITY_ID) return null;

  if (choice === "granted") {
    return (
      <>
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { allow_google_signals: false, allow_ad_personalization_signals: false });
            `}</Script>
          </>
        )}
        {CLARITY_ID && (
          <Script id="clarity-init" strategy="afterInteractive">{`
            (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_ID}");
            window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
          `}</Script>
        )}
      </>
    );
  }

  if (choice === "denied" || choice === "unknown") return null;

  return (
    <div
      role="region"
      aria-label="Analytics cookies"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-md border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-lift)]"
    >
      <p className="text-sm text-[var(--text-muted)]">
        Can Ritro use Google Analytics and Microsoft Clarity cookies to see how the site is used?
        Clarity records clicks and scrolling; your saves and email are always hidden.{" "}
        <Link href="/privacy#cookies" className="underline hover:text-[var(--accent)]">
          Privacy
        </Link>
      </p>
      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={() => setChoice("denied")}
          className="rounded-md border border-[var(--border-2)] px-3 py-1.5 text-sm text-[var(--text)] hover:bg-[var(--surface-2)]"
        >
          Decline
        </button>
        <button
          onClick={() => setChoice("granted")}
          className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm text-[var(--accent-text)] hover:bg-[var(--accent-hover)]"
        >
          Accept
        </button>
      </div>
    </div>
  );
}

// Lets a visitor change their answer later; AnalyticsConsent clears cookies and reloads if scripts were running
export function AnalyticsChoiceButton() {
  const choice = useChoice();
  if ((!GA_ID && !CLARITY_ID) || choice === null || choice === "unknown") return null;
  return (
    <button
      onClick={() => {
        setChoice(null);
      }}
      className="underline hover:text-[var(--accent)]"
    >
      Change your analytics choice
    </button>
  );
}
