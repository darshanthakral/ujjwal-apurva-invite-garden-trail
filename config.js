/* Approved Gujarati wedding songs, played through Spotify embeds only.
   Browsers/Spotify retain the right to block programmatic playback. */
window.WEDDING_CONFIG = Object.freeze({
  siteUrl: 'https://www.apurwal.in/',
  // Exact morning ceremony start not yet supplied; midnight IST = calendar-day countdown, NOT a ceremony time.
  eventStartISO: '2026-11-28T00:00:00+05:30',
  calendarStartDate: '20261128',
  calendarExclusiveEndDate: '20261201',
  defaultSpotifyId: '342HPeR0dUZlBdiXfYuARl', // Kanku Chhanti Kankotri — Ishani Dave
  spotifyTracks: [
  {
    "label": "Shubhaarambh",
    "artist": "Amit Trivedi · Shruti Pathak · Divya Kumar",
    "mood": "Festive opening",
    "spotifyId": "6qGCJLF0V7SuHTOOGUcDsv"
  },
  {
    "label": "Kanku Chhanti Kankotri",
    "artist": "Ishani Dave",
    "mood": "Wedding traditions",
    "spotifyId": "342HPeR0dUZlBdiXfYuARl"
  },
  {
    "label": "Aaj Vagdaavo Vagdaavo",
    "artist": "Parth Bharat Thakkar · Geetaben Rabari · Parth Oza",
    "mood": "Lagna celebration",
    "spotifyId": "5MlEZxSPLwgBkEKkr1J4QC"
  },
  {
    "label": "Khalasi",
    "artist": "Aditya Gadhvi · Achint",
    "mood": "Energetic Gujarati folk",
    "spotifyId": "3eQ9R68BJGbItarw7mHhSN"
  },
  {
    "label": "Kanku Chati Kankotri",
    "artist": "Namrata Soni",
    "mood": "Invitation song",
    "spotifyId": "3xU9HXbbgHPnRGwZ2HUxAs"
  }
],
});
