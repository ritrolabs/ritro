# Comparison page: evidence

Every fact the compare page states must be in this file, with its source and the date it was checked.
A fact with no source here does not go on the page. "Not found" means the official pages read did not
say it, so the page must not claim it either way.

Checked: **6 November 2026**, from the official pages listed. Prices are as shown to a visitor from
India unless stated; several sites change currency and price by region.

Archive copies: not made yet (archive.org could not be reached from the build machine). Before
publishing, save each source URL at https://web.archive.org/save and add the snapshot link here.

---

## Ritro (our own claims need proof too)

| Fact | Evidence |
| --- | --- |
| Work in progress, built and run by one person | `client/PRODUCT.md`: "Free, non-commercial personal project run by one person". The page must say this plainly. |
| Free, no paid plans | `client/PRODUCT.md`: "No pricing, plans or paid tiers exist." |
| Open source, AGPL-3.0 | `LICENSE` (GNU Affero General Public License v3) |
| AI tags, arriving seconds after a save | `client/src/lib/gemini.ts`, `client/src/app/api/jobs/tag-bookmark/route.ts` |
| Surprise me (one random save) | `client/src/app/api/bookmarks/random/` |
| Daily digest email of old saves | `client/src/app/api/digest/route.ts`. **Cannot be claimed yet:** it sends from Resend's testing address, which only reaches the account owner. Claim it once a sending domain is verified and PR #93 is merged. |
| Search covers titles, URLs, descriptions and tags, not the full page text | `client/src/components/DashboardClient.tsx` (search filter) |
| Chrome extension, not yet on the Chrome Web Store (installed from the source code) | `client/src/app/extension/page.tsx` |
| Bookmarklet for any browser | `client/src/app/bookmarklet/` |
| No mobile app | `client/PRODUCT.md` lists capture as website, extension, bookmarklet only |
| No import from other apps | No import route in `client/src/app/api/` |
| No highlights or reading view | Not in the codebase |
| Export everything as JSON; delete the account and all data yourself | `client/src/app/api/account/route.ts` (GET export, DELETE) |

---

## Pocket (shut down)

Source: Mozilla Blog, "Investing in what moves the internet forward", 22 May 2025,
https://blog.mozilla.org/en/mozilla/building-whats-next/

| Fact | Quote |
| --- | --- |
| Mozilla decided to shut it down (post dated 22 May 2025) | "we've made the difficult decision to phase out two products: Pocket" |
| Shut down 8 July 2025 | "Pocket shuts down July 8, 2025" |
| Export closed 8 October 2025, then data deleted | "Users can export saves anytime until October 8, 2025, after which their data will be permanently deleted." |

Also: https://getpocket.com/farewell , "While Pocket has shut down, Mozilla continues..."

---

## Raindrop.io

| Fact | Source | Quote |
| --- | --- | --- |
| Free plan, no limit on bookmarks, collections or devices | https://help.raindrop.io/limitations | "Raindrop.io is free to use with no limits on bookmarks, collections, or devices." |
| Free includes highlights, import and export | https://raindrop.io/pro/buy | "Unlimited highlights", "Import and export" |
| Pro yearly ₹3,104.08 inc. VAT (India) | https://raindrop.io/pro/buy (rendered page, screenshot) | "₹3,104.08 inc. VAT" |
| Apps for iOS and Android | https://raindrop.io/download | "iPhone & iPad", "Android" |
| Extensions: Chrome, Safari, Firefox, Edge | https://raindrop.io/pro/buy | "Apps for Mac, iOS, Android, Chrome, Safari, Firefox and Edge" |
| Reminders: Pro only | https://help.raindrop.io/limitations | "Reminders" listed for Pro, "—" for Free |
| AI Assistant and AI Suggestions: Pro only | https://raindrop.io/pro/buy | listed under "Pro yearly" |
| Full-text search: Pro only | https://help.raindrop.io/limitations | "Full-text search" "—" Free, "Yes" Pro |
| Imports from Pocket, Instapaper, Readwise Reader, Omnivore and more | https://help.raindrop.io/import | "Pocket — export as HTML file" |
| Web app and extensions are open source (MIT) | https://github.com/raindropio/app | "Source code of web app and browser extensions"; LICENSE.md "MIT License" |

Not found (do not claim): a digest email or any feature that resurfaces old saves on its own; automatic AI tagging specifically.

---

## Readwise Reader

| Fact | Source | Quote |
| --- | --- | --- |
| No free plan; 30-day free trial | https://readwise.io/read | "You can try Reader and Readwise with a free 30-day trial, no credit card required." |
| Reader with Highlights: $9.99/month billed yearly, $12.99 monthly | https://readwise.io/read | "$9.99/month billed annually, or $12.99/month billed monthly." |
| Reader only: $7.99/month billed yearly | https://readwise.io/pricing/reader | "Not included: Access to Highlights." |
| Web, iOS and Android apps | https://readwise.io/read | "Reader syncs across a powerful, local-first web app, iOS app, and Android app." |
| Extensions: Chrome and Chromium browsers, Firefox, Safari | https://docs.readwise.io/reader/docs/faqs | "browser extensions for Chrome, Chromium-based browsers (Edge, Brave, Arc, etc.), Firefox, and Safari." |
| **Resurfaces saved documents: a Daily Digest** | https://docs.readwise.io/reader/docs/faqs/daily-digest | "The Daily Digest collects an assortment of documents from your Feed and your Saved for Later" |
| Daily Review resurfaces highlights | https://readwise.io/read | "The Daily Review resurfaces the right highlight at the right time via email or app." |
| Optional AI auto-tagging (Ghostreader prompt) | https://docs.readwise.io/reader/docs/faqs/ghostreader | "make sure that auto-summarization or auto-tagging prompt is enabled on your Ghostreader preferences page." |
| Highlights and notes | https://readwise.io/read | "Highlight images, tables, rich text, and more. On any device." |
| Imports Instapaper; accepts a Pocket export file | https://readwise.io/read | "accepts your Pocket export file if you saved one before the shutdown" |
| Export as CSV, OPML, Markdown | https://readwise.io/read | "You can download every document as a CSV, your feeds as an OPML" |

Not found (do not claim): open source.

---

## Instapaper

| Fact | Source | Quote |
| --- | --- | --- |
| Free plan: unlimited saves, sync, folders | https://www.instapaper.com/premium | "Save unlimited articles, videos, and other pages" |
| Premium $5.99/month or $59.99/year | https://www.instapaper.com/premium | "$5.99 per month $59.99 per year" |
| Web, iOS and Android | https://www.instapaper.com/premium | "Sync your articles across web, iOS, and Android" |
| Full-text search: Premium | https://www.instapaper.com/premium | "Search through all of the articles you've saved to Instapaper, even ones you've archived." |
| Free plan limited to 5 notes a month | https://www.instapaper.com/premium | "Never worry about the 5-note monthly limit again." |
| AI voices (text to speech), Premium | https://www.instapaper.com/premium | "AI Voices & text-to-speech playlists on mobile" |

Not found (do not claim): browser extensions by name, resurfacing or digest, AI tagging, import, export, open source.
help.instapaper.com could not be reached; check it in a browser before publishing.

---

## Matter

Matter's own pricing, premium and FAQ pages returned 404, and getmatter.com returned 500. Facts come
from https://www.getmatter.com/ and the US App Store listing
https://apps.apple.com/us/app/matter-reading-app/id1501592184

| Fact | Source | Quote |
| --- | --- | --- |
| Free version with unlimited library, tags, full-text search | App Store | "Uncapped read-later library", "Unlimited tags", "Full-text search" |
| iPhone, iPad and web | https://www.getmatter.com/ | "Matter is the modern read-later app for iPhone, iPad, and web." |
| AI co-reader: Premium | App Store | "Seamless AI Co-Reader" |
| Highlights and notes | App Store | "Fluid highlighting and note-taking." |
| Syncs highlights to Notion, Obsidian, Readwise | App Store | "Sync your highlights to Notion, Obsidian, Roam, Readwise, and others." |

Not found (do not claim): Android app, a single current Premium price (the listing shows several conflicting
prices), resurfacing or digest, auto-tagging, import instructions, full library export, open source.

---

## What this means for the page

- **Resurfacing is not unique to Ritro.** Readwise Reader has a Daily Digest of saved documents and Raindrop has
  reminders (Pro). The honest claim is narrower: Ritro does it free, open source, with no setup.
- **Ritro is behind on most other rows:** no mobile app, no import, no highlights, no full-text search, extension
  not in the Chrome Web Store. The page has to show these.
- **Prices differ by region and plan.** Show "free plan: yes or no" and "paid from" with a link, not a hard
  price column, or state the region next to each price.
- **Don't publish the digest row** until the sending domain is set up.
