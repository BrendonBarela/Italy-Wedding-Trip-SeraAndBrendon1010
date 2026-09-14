# Sera & Brendon — Lean Trip App Update

This package replaces the current feature-heavy version with a simpler trip-first experience.

## What changed

- **Weather removed entirely.**
  - No live forecast modules.
  - No forecast API calls.
  - Today now shows **Bring today** based on that day's activity.
  - A collapsed **Packing by day** section covers all 18 days.

- **Private spending simplified.**
  - Same Private Trip Mode unlock.
  - Just an itemized record of purchases already made.
  - Running USD and EUR totals.
  - Add, edit, or remove an expense.
  - Device edits remain encrypted locally.
  - No planned budget, split calculator, category dashboard, or exchange-rate tool.

- **Transport rebuilt.**
  - Each move is a numbered route.
  - Fixed booking times are clearly marked.
  - Flexible pieces stay flexible.
  - Exact lodging directions still appear only after Private Trip Mode unlock.

- **Navigation cleaned up.**
  - Home
  - Today
  - Trip destinations
  - Wedding
  - Transport
  - Essentials
  - Budget appears only after Private Trip Mode is unlocked.

- **Food & Events is no longer a major feature.**
  - Restaurants, sights and event pins stay with each destination.
  - The old Food & Events page is reduced to a small pointer page for old bookmarks.

- **Private lodging remains encrypted.**
  - Exact private stay addresses are not stored in readable HTML/JS.
  - Villa Eden remains public because it is the guest-facing wedding venue.

## Upload

Upload every file in this package to the repository root and replace matching files.

Files not included in this package (styles.css, ux.css, wedding.html, icons, SVGs, manifest, etc.) remain unchanged.

After GitHub Pages deploys, refresh the installed app once so service-worker cache `v10` takes over.

## Private Trip Mode

The existing shared password continues to unlock the encrypted trip payload. The password itself is not written into the repository source.
