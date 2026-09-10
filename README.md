# Sera & Brendon Wedding Trip — v5

This version gives every destination its own page:
- verona.html
- parma.html
- ispra.html
- santa-margherita.html
- nice.html

Each page contains:
- a privacy-safe nearby public landmark representing the stay area
- an interactive map
- three researched nearby restaurant recommendations plotted on that map
- no exact lodging address in the map data

Other pages:
- index.html
- transportation.html
- wedding.html
- guest-info.html
- destinations.html (destination chooser)

Upload ALL files in this ZIP to the root of the GitHub repository, replacing existing files.


## v5.1 map fix
The original v5 loaded Leaflet's CSS but accidentally omitted the Leaflet JavaScript library.
v5.1 adds Leaflet JS before script.js on every HTML page so the interactive maps render correctly.

## v6 visual refresh
- Added large destination photography to each city page.
- Added photographic destination cards on the homepage.
- Added destination taglines and quick-glance chips.
- Added Map / Restaurants jump links.
- Refined map cards, spacing, typography, shadows, and mobile layout.
- Keeps the v5.1 Leaflet JavaScript map fix.

## v7 trip guide upgrade
- Home page now includes a chronological itinerary timeline.
- Every destination map now includes the stay area, restaurants, the main transit point, and major sights.
- Map popups include a Directions link.
- Added Things to Do and Good to Know sections to each destination.
- Ispra now has a dedicated Wedding Weekend callout.
- Geocoding is sequential and cached locally after the first successful visit for better reliability.
