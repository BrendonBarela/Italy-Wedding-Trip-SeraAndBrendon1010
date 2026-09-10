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

## v7.1 map reliability fix
- Switched the primary Leaflet CDN from unpkg to cdnjs.
- Removed unnecessary crossorigin attributes.
- Added automatic Leaflet fallbacks through jsDelivr and unpkg.
- Added a fallback map tile provider if OpenStreetMap tiles fail.
- Added a second geocoding fallback and visible loading/error states.

## v8
- Removed the public-landmark concept.
- Uses the actual lodging address for Verona, Parma, and Ispra.
- Santa Margherita Ligure and Beaulieu-sur-Mer booking sites currently withhold the complete street address, so those two map pins use the booking-platform property area until the confirmation address is supplied.
- Replaced hot-linked destination images with local SVG postcard artwork stored in /images, so hero images no longer depend on third-party image hosts.
- Removed browser geocoding completely. All map dots now use fixed latitude/longitude coordinates.
- Switched marker rendering to Leaflet circle markers for simpler, more reliable colored dots.
- Added mobile-simplified navigation, vertical mobile itinerary, next-stop cards, and a more personal wedding-focused homepage hero.

## v8.1 lodging address update
- Santa Margherita Ligure: updated to Via Partigiani D'Italia, 25 and placed the stay dot at the property coordinates.
- Beaulieu-sur-Mer: updated to Boulevard Eugène Gauthier. The supplied address does not include a building number, so the dot is placed on the correct boulevard rather than pretending to identify an exact doorway.
