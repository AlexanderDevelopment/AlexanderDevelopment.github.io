# Steam Game Artwork

## Overview

The homepage game carousel in `index.html` uses Steam `header_image` artwork for each listed app. Steam can change both the cache-busting `t` value and the hashed asset folder when store artwork is updated, so the site keeps a local cache at `data/steam-games.json` instead of relying on hardcoded CDN paths forever.

## Files

- `data/steam-games.json` stores the latest known Steam `headerImage` URL for each app ID.
- `scripts/update-steam-game-art.mjs` refreshes that cache from Steam Store appdetails.
- `.github/workflows/update-steam-game-art.yml` runs the refresh on a schedule and can also be started manually from GitHub Actions.
- `index.html` keeps current artwork as a no-JavaScript fallback, then loads `data/steam-games.json` and applies the cached URLs to slides marked with `data-steam-app-id`.

## Update Flow

- GitHub Actions runs every 6 hours and commits `data/steam-games.json` only when Steam returns changed artwork URLs.
- To update immediately after changing Steam art, run the `Update Steam game artwork` workflow manually.
- For a local refresh, run `node scripts/update-steam-game-art.mjs` from the repository root, then commit the updated JSON.

## Adding Or Removing Games

- Add or remove the slide in `index.html`.
- Make sure the slide has `data-steam-app-id="APP_ID"`.
- Add or remove the matching app ID entry in `data/steam-games.json`; the updater uses the JSON keys as its source list.
- Keep the inline `--game-image` and `.game-logo` `src` as sensible fallbacks for visitors whose browser cannot load the JSON cache.
