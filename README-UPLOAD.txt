Wedding Trip Site v18 — Simplified UX

Upload ALL files in this folder to the ROOT of the GitHub repository and replace files with the same names.

Files:
- index.html — keeps the full trip overview, adds the compact navigation immediately.
- today.html — simplified four-card Today screen; weather and full itinerary are tucked into expandable sections.
- ispra.html — includes the three-lodging-pin map fix plus the simplified mobile experience.
- ux.css — new visual hierarchy and mobile progressive-disclosure styles.
- ux.js — compact Home / Today / Trip / Wedding / More navigation; mobile Explore Nearby controls; collapsible recommendations.
- manifest.webmanifest — installed app now launches to Today and adds Today/Wedding/Transport app shortcuts.
- sw.js — cache v5 and automatically injects ux.css/ux.js into all other existing pages after the service worker takes control.

Nothing was removed. Detailed maps, food/events, transportation, wedding information and the complete itinerary are still available.
No analytics or view counter was added.

After uploading, hard-refresh the website once. Existing installed PWAs may need to be closed and reopened after the service worker updates.
