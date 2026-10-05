# Ujjwal & Apurva — Save the Date | Final V5

A five-section, mobile-first static website for 28–30 November 2026 in Nagpur. **Deploy the contents of this ZIP to the website root** so that `index.html` is served at `https://www.apurwal.in/`. It works on ordinary static hosting and needs no build step, database or API keys.

## This update

- Replaced the Hasta Melap celebration-card photograph with the newly approved, specifically generated hands photograph. The website uses the new, compression-optimized `assets/images/hasta-melap-v5-card.webp` with a new filename to avoid stale browser/CDN caches. The full-resolution web-optimized `assets/images/hasta-melap-v5.webp` is also included for future layouts.
- Introduced an elegant entrance screen with **Enter with music** and **Enter without music**. The music entry button requests **Kanku Chhanti Kankotri — Ishani Dave** through the official Spotify Embed iFrame API when the user enters. The requested track ID is `342HPeR0dUZlBdiXfYuARl`.
- Preserved the Spotify-only song picker; listeners can choose a different song and use the built-in Spotify playback controls. The small music control remains available throughout the page.
- Added a graceful fallback: if Spotify SDK loading or audible autoplay fails, the music panel offers the official direct Spotify embed. The existing songs, event dates, family names, calendar download and original venue links are retained.
- Added accessible keyboard focus for the entrance, reduced-motion-aware fading and subtle gold/rose opening animations. Existing three-event desktop alignment remains intact.
- Preserved the current illustrated couple favicon, Apple touch icon and custom WhatsApp/social preview.
- Deployment fixes: all absolute URLs (canonical, social preview, sitemap, robots, config) now use `https://www.apurwal.in/` because the bare domain redirects to www and WhatsApp may not follow redirects for preview images; favicon reduced from 517 KB to 31 KB (192×192) with no visible change.

## Important playback limitation

**Entering the site cannot guarantee audible Spotify playback on every device.** Even after a guest taps **Enter with music**, iOS/Safari, Chrome autoplay rules, Spotify region/account requirements and third-party blocking may prevent programmatic playback. In that case the music panel opens and guests press **Play** in Spotify's official player. Automatic music on initial page load *without any gesture*, automatic crossfades and hidden audio streams are intentionally not claimed or attempted. Do not download or self-host Spotify tracks without the appropriate rights.

To reorder songs or change the first song, edit `spotifyTracks` and `defaultSpotifyId` in `config.js`. Spotify embeds and Google Fonts require a live internet connection.

## Important: confirm venue maps before sharing

Three previously supplied `share.google` short links are preserved **without changes**. These destinations have not been independently verified as the correct locations. Open each link on your phone and check it takes guests to the actual venue. If a link is wrong, replace that `href` in `index.html` with the approved Google Maps share URL before launch.

## Calendar and countdown

The countdown currently targets the **start of 28 November in India (00:00 IST)**, not an unprovided ceremony start time. Set `eventStartISO` in `config.js` when you confirm the actual time. The Save the Date button generates an all-day calendar entry covering 28–30 November 2026.

## Files and deployment

Upload `index.html`, `config.js`, `script.js`, `styles.css`, `assets/`, `robots.txt` and `sitemap.xml` together to the domain's public site directory. Set HTTPS and verify `https://www.apurwal.in/assets/images/hasta-melap-v5-card.webp` loads. Then test the invitation on a real Android phone and iPhone, including Spotify sound after the entrance tap, map destinations, and the social preview. If a CDN is in front of your site, invalidate cached HTML/CSS/JS after replacing the files. The photograph has a new name to avoid asset caching.

**Technical checks:** JavaScript syntax, HTML/assets and mocked Spotify API interaction are validated. Browser end-to-end navigation was restricted in the creation environment, so real-device playback and visual acceptance still need deployment testing.
