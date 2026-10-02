# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, single-page "save the date" wedding website for Ujjwal & Apurva (28–30 November 2026), intended for hosting at apurwal.in. There is no build step, package manager, linter, or test suite — just `index.html`, `script.js`, and `assets/`. Not a git repository.

- **Preview:** open `index.html` directly in a browser, or serve the folder (e.g. `python3 -m http.server`). Google Fonts needs network access.
- **Deploy:** the user uploads `index.html`, `script.js`, and `assets/` together to the web root, keeping the folder structure. Nothing here publishes automatically.

- **Link preview / favicon:** Open Graph tags in `<head>` use absolute `https://www.apurwal.in/` URLs (required by WhatsApp; the bare apurwal.in domain 308-redirects to www, so use www). `assets/og-image.jpg` is rendered from `design/og-card/card.html` (site fonts, 1200×630, faces kept in the centre 630px square so square-cropped thumbnails still work) via headless Chrome: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --window-size=1200,630 --virtual-time-budget=6000 --screenshot=out.png file://…/card.html`, then converted to JPEG. Headless Chrome writes the file but may not exit — kill it after the PNG appears. Favicons are circular crops of `design/couple-illustration.png`. `design/` is not deployed.

`README.txt` is the user-facing hand-off note (changelog, artwork provenance). Keep it in sync when behaviour it describes changes.

## Architecture

### Page structure (`index.html`)
All CSS is inline in a single `<style>` block. `<main>` contains exactly three `<section>`s — `#home`, `#dates`, `#message` — which are the "chapters". The fixed `.chapter-nav` has three links in the same order, and `script.js` relies on that **index alignment** between `main > section` and `.chapter-nav a`. Adding, removing, or reordering a section requires updating both together.

### CSS is layered: base + override
The stylesheet has two layers. The first (up to the `prefers-reduced-motion` / 520px media queries) is the original design. After the comment `/* A quieter wedding palette, with the original three-chapter composition. */` comes an override layer that redefines `--orange`/`--gold` and re-declares many of the same selectors and breakpoints. **The override layer wins**, so when changing a style, check that later block first — editing only the earlier rule often has no visible effect. Some selectors in the base layer (`.ganesh-mark`, `.orbit`, `.burst`, `.event-art`, `body.locked`) no longer have matching markup.

The closing monogram's size is set by the `--badge` custom property on `.closing` (overridden per breakpoint), and both decorative rings in `.closing-orbit` are multiples of it, so they always clear the family sign-off below. Change `--badge` rather than `.monogram{width}`.

### Behaviour (`script.js`)
Plain ES, no dependencies.

- **Chapter tracking:** a rAF-throttled scroll handler (`updatePage`) updates the top progress bar and picks the current chapter as the last section whose top is above 44% of the viewport (forced to the last chapter at page bottom), then sets `aria-current` on the matching nav link.
- **Reveal animations:** `.reveal` elements get `.visible` via `IntersectionObserver` (immediate if unsupported; `<noscript>` and `prefers-reduced-motion` also neutralise them).

The site previously had a Spotify music player; it was removed in October 2026 at the user's request.
