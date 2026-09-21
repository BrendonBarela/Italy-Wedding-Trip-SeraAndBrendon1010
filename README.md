# Sera & Brendon · Wedding Trip 2026

Static website and installable PWA, hosted on GitHub Pages.

## September 21 update
- Lodging addresses and group contacts open directly in both the website and installed app, without a password.
- Wedding dinner: Ristorante dei Limoni, Ispra; October 10 around 8:00 PM, 11 guests. Confirmed by restaurant email September 20.
- Wedding timeline retains Marta’s 3–7 PM coverage, Alex as ring bearer and Colleen on music.
- Baggage information and existing travel details preserved.

`trip-data.js` holds shared itinerary, lodging and contact data. `private.js` is now a direct-access lodging renderer; its filename remains for compatibility with cached pages. No password or encryption key is required.

After deployment, open the app online and refresh to receive the updated offline cache. Older upload instruction files describe historical releases.
