# Sera & Brendon — Italy Wedding Trip PWA

October 2026 wedding / honeymoon trip site and installable PWA.

## Current architecture

- Public GitHub Pages site: itinerary, wedding information, destination guides, restaurants, events, weather and transportation.
- Installed PWA: opens to `today.html`.
- Private Trip Mode: available only when the site is running as an installed standalone PWA.
- Exact personal lodging locations are stored in `private-trip.enc`, encrypted with AES-256-GCM.
- The private password is **not stored in this repository**.
- Booking confirmation numbers, ticket numbers, access codes, host phone numbers and Wi-Fi passwords are **not stored in the repository**, even encrypted.
- A small local booking-code locker is available after Private Trip Mode is unlocked; anything entered there stays in the browser's local storage on that device.

## Canonical trip data

Public itinerary and transportation timing lives in `trip-data.js`.

Confirmed train times currently reflected there:
- Oct 7: IC 580, Parma 10:39 AM → Milano Centrale 12:15 PM.
- Oct 11: IC 665, Milano Centrale 12:10 PM → S. Margherita Ligure-Portofino 2:16 PM.
- Oct 14: Santa Margherita 10:14 AM → Genova Brignole 11:02 AM; Genova 11:35 AM → Ventimiglia 2:12 PM; Ventimiglia 2:40 PM → Beaulieu-sur-Mer 3:26 PM.

These replace older planning estimates that had drifted across pages.

## Privacy model

The normal website shows only a city / approximate stay area for personal lodging. The wedding venue remains public because guests need directions.

When Private Trip Mode is unlocked in the installed PWA, `private.js` decrypts `private-trip.enc` locally using Web Crypto and reveals:
- exact lodging address;
- one-tap Directions Home;
- useful private check-in / checkout notes.

The decrypted data is kept only for the current app session.

## Offline behavior

`sw.js` caches the core itinerary, private encrypted payload, scripts and static pages. Core text remains usable offline. Live weather, map tiles and external directions still require network access unless those services are separately cached by the device.

## Files added in the privacy / cleanup pass

- `trip-data.js`
- `private.js`
- `private-trip.enc`

Key replacement files:
- `script.js`
- `ux.js`
- `sw.js`
- `today.html`
- `essentials.html`
- `transportation.html`
- `verona.html`
- `parma.html`
- `ispra.html`
- `santa-margherita.html`
- `nice.html`

## Important repository-history note

Removing private details from the current branch does not erase older Git commit history. If old commits contained exact addresses, those historical commits may still be retrievable while the repository remains public. A full history purge is a separate Git operation.
