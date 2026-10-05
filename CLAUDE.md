# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, mobile-first "save the date" wedding website for Ujjwal & Apurva (Nagpur, 28–30 November 2026), live at https://www.apurwal.in. No build step, dependencies, linter, or tests — `index.html`, `styles.css`, `config.js`, `script.js`, `assets/`, plus `robots.txt` / `sitemap.xml`. `README.md` is the user-facing hand-off note (changelog, Spotify limits, things still to confirm); keep it in sync.

- **Preview:** `python3 -m http.server 8000` (also `npm run serve`). Google Fonts and Spotify need network access. Use http, not `file://`, so the Spotify iFrame API behaves.
- **Deploy:** `origin` is github.com/darshanthakral/ujjwal-apurva-invite-garden-trail. Vercel (project `project-apurwal`, account `code-guy1`) deploys `main` to www.apurwal.in on every push, so **pushing `main` publishes immediately**; other branches get login-protected Vercel previews. Earlier versions are on branches: `engagement-invite-backup` (engagement invite) and `save-the-date` (the first save-the-date). The `royal` remote (project-apurwal repo) is not the live site. This machine has no stored GitHub credentials — the user pushes from their own terminal.
- **Absolute URLs must use `https://www.apurwal.in/`** (canonical, `og:*`, `twitter:image`, `config.js` `siteUrl`, robots, sitemap). The bare `apurwal.in` 308-redirects to www, and WhatsApp may not follow a redirect for the preview image. When changing the share image, give it a **new filename** — WhatsApp/CDN cache by URL.
- `apurwal-save-the-date-FINAL-v5-deploy/` and its `.zip` in the repo folder are the user's original v5 delivery, excluded via `.git/info/exclude`; the tracked root files are that build plus fixes (www URLs, 192px palette favicon, `python3`). `design/couple-illustration.png` is the source illustration for the favicons/share image and is not referenced by the page.

## Architecture

### Content and configuration
`config.js` sets `window.WEDDING_CONFIG` (frozen): countdown target `eventStartISO` (currently midnight IST on 28 Nov — no ceremony time supplied yet), calendar dates for the `.ics` download, and the Spotify song list (`spotifyTracks`, `defaultSpotifyId`). Change songs/dates there, not in `script.js`. Event cards, family names and the three venue map links (`share.google` short links, not yet verified by the user) are hard-coded in `index.html`.

### Page flow (`index.html`)
A `#welcomeGate` entrance dialog ("Enter with music" / "Enter without music") locks scrolling (`body.entrance-locked`) until dismissed. Then five sections: `#home` (hero), `#invitation` (countdown), `#celebrations` (three event cards with venue buttons), `#beginning` (interlude), `#families` (closing + "Save the Date" `.ics` button). `#musicPanel` is a popover opened from the topbar music button.

### Behaviour (`script.js`, one IIFE)
- Scroll progress bar + `topbar.scrolled`; `.reveal` → `.is-visible` via IntersectionObserver (skipped under reduced motion).
- Countdown from `eventStartISO` (explicit +05:30, not browser locale); swaps to `#countdownEnded` when reached.
- Calendar button builds an all-day iCalendar blob client-side (DTEND is exclusive, so `20261201`).
- Music: a plain Spotify embed iframe is mounted immediately, then the Spotify iFrame API (`createController`) replaces it if it loads. "Enter with music" calls `play()` within the click gesture; if `playback_started`/`playback_update` doesn't confirm within ~4.7s, the panel opens so the guest can press Play. Autoplay is never guaranteed (browser/Spotify policy) — don't claim or attempt hidden audio.

### CSS is layered revisions (`styles.css`)
The file is a base design followed by successive override blocks marked by comments ("Final revision overrides…", "Locked final revision…", "v4 final polish…", "Final V5…", and a last focus/photo block). **Later blocks win** — when a style change has no effect, look for the same selector in a later block. Rules are long single lines; edit with exact-string replacement.
