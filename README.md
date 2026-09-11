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

## v9
- Destination artwork is referenced from the repository root (verona.svg, parma.svg, etc.), so no images folder is required for phone uploads.
- Added map toggle buttons: All / Stay / Food / Transit / Sights.
- Map dots continue to use fixed coordinates and simple Leaflet circle markers; no geocoding API is used.
- Added one-tap Google Maps directions for stays and restaurants.
- Restaurant cards now have useful categories such as date night, casual local, or special occasion.
- Added Today & Daily Itinerary page with all Oct 1–18 dates and automatic current-day highlighting.
- Added automatic trip/wedding countdown to the homepage and Today page.
- Added detailed Getting Around Ispra section and Oct 7–8 ferry-status notice.
- Added Oct 7–10 Wedding Weekend mini-agenda.

## v9.1
- Added a View our stay listing button to all five destination pages.
- Santa Margherita and Beaulieu use the final Vrbo share links supplied by Brendon.
- Verona and Parma use their Airbnb listings; Ispra uses the Villa Eden Expedia listing.

## v10
- Simplified to one horizontal navigation bar: Home, Verona, Parma, Ispra, Santa Margherita, Nice, Wedding, Transport.
- Removed destinations.html from the site/navigation.
- Destination heroes now use real Wikimedia Commons photography, with the existing local SVG artwork as a fallback.
- Added a Photo Credits page with source/license attribution.
- Added Coffee, Grocery, Pharmacy, and Parking quick-find links to every destination map.
- Added fixed Ispra map pins/toggles for Pasticceria Angleria, Tigros, Lafarmacia Ispra, and Piazzale Ranci Ortigosa parking.

## v10.1
- Combined Coffee, Grocery, Pharmacy, and Parking into the Things Near Us filter row.
- Practical buttons now behave like real map filters instead of a separate link row.
- Nearby practical places load from OpenStreetMap around each stay and are cached for seven days.
- If a practical category has no OpenStreetMap results, its button falls back to a nearby Google Maps search.
- Revamped the single navigation bar with a sticky glass-style header, active-page pill, and swipeable mobile navigation.

## v10.2
- Improved desktop navigation spacing, active-state styling, and hover behavior.
- Fixed mobile navigation so every city page is always visible in a horizontally swipeable row.
- Explicitly overrides older CSS rules that previously hid individual city links on small screens.

## v10.3
- Standardized the Things Near Us controls on Verona, Parma, Ispra, Santa Margherita, and Nice/Beaulieu.
- Every destination now has the exact same buttons: All, Stay, Food, Coffee, Grocery, Pharmacy, Transit, Parking, Sights.
- Every destination now has the same expanded legend and map instructions.
- Coffee, Grocery, Pharmacy, and Parking are loaded consistently from OpenStreetMap around each stay.
- Empty practical categories now stay in the same filter row and offer a Google Maps fallback instead of behaving like a different kind of link.

## v10.4
- Made the mobile navigation much more visible against destination photography with a dark translucent sticky header.
- All city pages are always shown directly in the mobile navigation: Verona, Parma, Ispra, Santa Margherita, and Nice.
- Kept Wedding and Transport in the same primary navigation so guests never need to return Home just to move around the site.
- Active page is highlighted with a bright white pill for stronger mobile contrast.

## v10.5
- Kept the desktop navigation from v10.4 unchanged.
- Reworked mobile navigation into a compact two-row 4-column grid.
- Removed horizontal scrolling on mobile.
- Hid the S & B brand on small screens to give the navigation more room.
- Kept direct links to every city, Wedding, and Transport visible at once.

## v10.6
- Rebuilt mobile navigation with strong CSS overrides so older rules cannot change its layout.
- Mobile navigation is now a true two-column grid with all eight links visible.
- Replaced transparent/glass navigation backgrounds with solid cream, tan, brown, and muted rose colors.
- Navigation is separated from destination photography instead of floating visually over the image.
- Desktop navigation remains unchanged.

## v11
- Mobile navigation now uses fully opaque solid colors with explicit background-image and opacity overrides.
- Hero photography can no longer show through the mobile header or navigation buttons.
- Desktop navigation remains unchanged.
- Added a Wedding Crew / Who's Doing What checklist.
- Brendon's sister is assigned as officiant and Sera's dad is assigned to walk Sera out.
- Champagne, music, rings, photographer contact, ceremony setup, and cleanup remain clearly marked Needs an owner.

## v11.1
- Replaced the large mobile navigation grid with a compact Menu dropdown.
- Mobile header now shows S & B plus one solid-brown Menu button.
- Tapping Menu reveals direct links to every city, Wedding, and Transport.
- Menu closes after a destination is selected.
- Desktop navigation remains unchanged.

## v11.2
- Fixed the mobile Menu button JavaScript so it actually opens and closes the navigation.
- Mobile navigation is hidden by default and only appears after tapping Menu.
- Added strong final CSS overrides for the dropdown.
- Added cache-busting query strings to styles.css and script.js so phones do not keep serving the older grid-menu files.
- Desktop navigation is unchanged.

## v12
- Added 🎉 Events to Things Near Us on every destination map.
- Verona: Frida Kahlo – A Revolutionary Life at Teatro Ristori (Oct 3–4).
- Parma: Mercanteinfiera Fall 2026 and Festival Verdi.
- Ispra: no confirmed public event matched Oct 7–11 as of this research update; the site says so rather than inventing one.
- Santa Margherita: nearby Madonna dei Gotti festival in Camogli on Oct 11.
- Nice/Beaulieu: Forró de Nice (Oct 15–18) and Festival CaraïbAzur (Oct 17).
- Event pins include dates, directions, and event-info links.

## v13
- Standardized Things Near Us filters on every destination: All, Stay, Food, Coffee, Grocery, Pharmacy, Transit, Parking, Events, Sights.
- Homepage destination cards now use the same real Wikimedia destination photography as the city heroes, with local SVG fallback art underneath.
- Added a Today navigation shortcut that becomes prominent automatically during Oct 1–18; it is also visible while viewing today.html.
- Added researched event chips to the relevant dates on the Today itinerary, linked conceptually to each city's Events map filter.
- Removed guest-info.html from the package; destinations.html was already absent from the package.
- Added dynamic weather cards to all five destination pages and the Today page.
- Weather uses Open-Meteo's no-key forecast API and displays trip dates automatically once they enter its 16-day forecast window.
- Weather cards show condition, high/low in °F and °C, and precipitation probability.

## v14
- Rebuilt Transportation as a check-in/check-out based Travel Day Planner.
- Oct 4 Verona → Parma: target roughly noon departure, timed to Parma's 3 PM check-in.
- Oct 7 Parma → Milan → Malpensa → Ispra: direct Parma–Milan recommendation plus Malpensa Express and rental-car timing.
- Oct 11 Ispra → MXP → Milan → Santa Margherita: rental return buffer, airport train, and buffered Milan connection.
- Oct 14 Santa Margherita → Ventimiglia → Beaulieu: recommended cross-border connection timed to 3 PM check-in.
- Oct 18 Beaulieu → Nice Saint-Augustin → NCE Terminal 2: planned around ~9 AM checkout and the 12:35 PM Air Canada flight.
- Each leg now has route-specific Omio, Trainline, SNCF, or official Malpensa Express links.
- Today travel-day cards now jump directly to the matching travel-plan section.
- All train times are labeled as planning targets / current timetable patterns and should be verified on the linked booking page before purchase.

## v14.1
- Added Oct 1 Verona arrival transfer from Verona Airport (VRN) to Raggio di Luna Apartment.
- Recommended direct taxi after the 12:45 PM Air Dolomiti EN 8210 arrival; included official airport taxi link.
- Added AirLink 199 as the low-cost alternative: airport → Verona Porta Nuova, then short walk to the stay.
- Changed primary train-search buttons to Trainline's documented date/time deep-link format so the travel date and target departure time are prefilled.
- Kept Omio as a secondary comparison on useful routes.
- Explained why ordinary Omio links do not reliably preserve a future date, while Omio's date-prefilled affiliate widget requires a valid partner ID.
- Oct 1 on the Today page now jumps directly to the airport-transfer plan.
