# Steam Game Artwork

## Overview

The homepage games section in `index.html` uses a trailer showcase. Each project has a selectable tab, a horizontal 16:9 Steam HLS trailer with audio, overlay sound controls with a volume slider, and Steam `header_image` artwork as the poster/fallback.

Steam can change both the cache-busting `t` value and the hashed asset folder when store artwork is updated, so the site keeps a local cache at `data/steam-games.json` instead of relying on hardcoded CDN paths forever.

## Files

- `data/steam-games.json` stores the latest known Steam `headerImage` URL for each app ID.
- `scripts/update-steam-game-art.mjs` refreshes that cache from Steam Store appdetails.
- `.github/workflows/update-steam-game-art.yml` runs the refresh on a schedule and can also be started manually from GitHub Actions.
- `index.html` keeps current artwork as a no-JavaScript fallback, then loads `data/steam-games.json` and applies the cached URLs to elements marked with `data-steam-app-id`.
- `index.html` stores the current Steam HLS trailer URL on each `.game-trailer` as `data-hls-src`.
- `index.html` also keeps the SteamDB `microtrailer.mp4` URL as the regular `src` fallback for browsers where HLS cannot be played.
- `index.html` loads pinned `hls.js@1.6.16` from jsDelivr so Chromium/Firefox can play HLS. Safari uses native HLS when available.
- `.game-preview-media` is the horizontal 16:9 player shell. Keep the trailer itself at `object-fit: contain` so horizontal videos scale down on vertical screens without changing proportions or cropping into a vertical preview.
- `[data-game-sound-toggle]` controls the shared trailer audio state. Autoplay starts muted; a user click on the overlay button unmutes the active trailer and keeps that sound preference when switching games.
- `[data-game-volume-slider]` controls the shared trailer volume for every panel. The slider starts disabled while audio is muted, becomes active when sound is enabled, and is disabled again when sound is turned off.

## Trailer Sources

Use Steam Store appdetails or SteamDB to find the current highlighted trailer URLs. Prefer the Steam HLS `hls_264_master.m3u8` source for the main player because Steam microtrailer MP4 files are silent video-only previews. Keep the direct `microtrailer.mp4` as a fallback source.

- DREADWAY (`3215820`) HLS: `https://video.akamai.steamstatic.com/store_trailers/3215820/1935248400/a4ae30aecc773d8423b5817c396b7e03edbf9607/1765930059/hls_264_master.m3u8?t=1765934506`
- DREADWAY fallback MP4: `https://video.fastly.steamstatic.com/store_trailers/3215820/1935248400/a4ae30aecc773d8423b5817c396b7e03edbf9607/1765930059/microtrailer.mp4`
- OPEN UP SIR! (`4454760`) HLS: `https://video.akamai.steamstatic.com/store_trailers/4454760/1040176759/d3afc48786063a30a1c68a5368d4aed4226f4b92/1774457001/hls_264_master.m3u8?t=1774457480`
- OPEN UP SIR! fallback MP4: `https://video.fastly.steamstatic.com/store_trailers/4454760/1040176759/d3afc48786063a30a1c68a5368d4aed4226f4b92/1774457001/microtrailer.mp4`
- NO MORE COWS (`4635170`) HLS: `https://video.akamai.steamstatic.com/store_trailers/4635170/191898554/6d712337c5c30e7b4c29fd9846a321dc49dfbf7f/1777411645/hls_264_master.m3u8?t=1777411970`
- NO MORE COWS fallback MP4: `https://video.fastly.steamstatic.com/store_trailers/4635170/191898554/6d712337c5c30e7b4c29fd9846a321dc49dfbf7f/1777411645/microtrailer.mp4`

When updating a trailer URL, test that the HLS manifest returns `200` and contains an audio stream. `ffprobe -show_entries stream=codec_type,codec_name,width,height URL` should show `aac` audio plus `h264` video. Also test that the fallback MP4 returns `200` with `Content-Type: video/mp4`.

## Update Flow

- GitHub Actions runs every 6 hours and commits `data/steam-games.json` only when Steam returns changed artwork URLs.
- To update immediately after changing Steam art, run the `Update Steam game artwork` workflow manually.
- For a local refresh, run `node scripts/update-steam-game-art.mjs` from the repository root, then commit the updated JSON.

## Adding Or Removing Games

- Add or remove the matching `.game-tab` and `.game-showcase-panel` in `index.html`.
- Make sure the tab and panel have `data-steam-app-id="APP_ID"`.
- Make sure the tab's `data-game-tab`, the panel's `data-game-panel`, and their ARIA `id` / `aria-controls` / `aria-labelledby` values stay paired.
- Add or remove the matching app ID entry in `data/steam-games.json`; the updater uses the JSON keys as its source list.
- Keep the inline `--game-image`, `.game-thumb`, `.game-poster`, `.game-logo`, and video `poster` values as sensible fallbacks for visitors whose browser cannot load the JSON cache.
- Add or update the `.game-trailer` `data-hls-src` with the current Steam HLS URL.
- Add or update the `.game-trailer` `src` with the current SteamDB `video/mp4` microtrailer fallback URL.
- Keep one `.game-audio-controls` block inside each `.game-preview-media` so every selected panel exposes the same sound toggle and `[data-game-volume-slider]` control.
