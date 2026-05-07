# OPEN UP SIR! Publisher Pitch

## Public URL

Hidden publisher link:

`https://zweibier-indie.de/pitch/open-up-sir/`

The page is intentionally not linked from `index.html` or the public footer. It includes:

- `meta name="robots" content="noindex, nofollow, noarchive"` to discourage indexing.
- Desktop interactive HTML pitch deck.
- Mobile-first vertical slide image view for phone browsers.
- `Download PDF` button that downloads `pitch/open-up-sir/open-up-sir-pitch-deck.pdf`.

This is link-hidden, not password-protected. Anyone with the URL can open it.

## Source

Current source project:

`D:\Documents\New project`

Copied website files:

- `pitch/open-up-sir/index.html`
- `pitch/open-up-sir/styles.css`
- `pitch/open-up-sir/script.js`
- `pitch/open-up-sir/assets/`
- `pitch/open-up-sir/open-up-sir-pitch-deck.pdf`

The downloadable PDF currently uses the flat high-quality export:

`D:\Documents\New project\Exports\open_up_sir_pitch_deck_flat.pdf`

Mobile page images are generated from the latest rendered QA pages:

`D:\Documents\New project\Exports\qa\funding-roadmap-update\page-01.png` through `page-17.png`

They are stored as optimized JPEGs in:

`pitch/open-up-sir/assets/mobile-pages/`

## Update Flow

When the pitch deck changes:

1. Re-export the source HTML deck and PDF from `D:\Documents\New project`.
2. Copy the updated HTML/CSS/JS/assets into `pitch/open-up-sir/`.
3. Replace `pitch/open-up-sir/open-up-sir-pitch-deck.pdf` with the latest flat PDF.
4. Regenerate the `assets/mobile-pages/page-*.jpg` files from the latest QA page renders.
5. Re-test desktop and mobile viewport rendering before publishing.
