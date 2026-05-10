# OPEN UP SIR! Publisher Pitch

## Public URL

Hidden publisher link:

`https://zweibier-indie.de/pitch/open-up-sir/`

The page is intentionally not linked from `index.html` or the public footer. It includes:

- `meta name="robots" content="noindex, nofollow, noarchive"` to discourage indexing.
- Desktop interactive 18-slide HTML pitch deck.
- Mobile-first vertical slide image view for phone browsers.
- `Download PDF` button that downloads `pitch/open-up-sir/open-up-sir-pitch-deck.pdf`.
- Slide 1 interactive trailer mini-preview for `https://youtu.be/c59w_SwHOLk`, using the YouTube IFrame API after the viewer clicks play. The preview starts with sound after the user gesture and includes a `Mute` button plus a volume slider defaulted to 45%.
- Slide 1 `Proof Of Concept` link:
  `https://drive.google.com/drive/folders/1pEeE3I0hxa_EsD4twyH-9-1xvR0pWpZZ?usp=drive_link`
- Mobile deck mode keeps static slide images, so the first mobile slide adds direct `Watch trailer` and `Proof Of Concept` links below the image instead of embedding the interactive player.
- Publisher-friendly funding framing:
  - fixed total game budget: €150,000;
  - FFF Bayern grant applied: €82,000, Bavaria-only spend;
  - external financing gap: €68,000;
  - flexible passive investor, professional publisher, hybrid, and custom collaboration structures.
- Publisher proof updates:
  - OPEN UP SIR! social proof slide: 5M TikTok concept views, 8K Steam wishlists, and TikTok removed after concept validation;
  - market positioning slide with Embr, OPEN UP SIR!, and Firefighting Simulator - The Squad, with OPEN UP SIR! positioned between aging party co-op games and serious firefighting simulators as a friendslop adventure for one or two evenings;
  - Dreadway proof points as of April 2026: 45K wishlists, $55K gross revenue, about 20M total social views, and an almost-zero production budget.
- Latest visual pass:
  - main slide headings use a 2mm black text outline;
  - Slide 15 uses a three-card competitor comparison and positions OPEN UP SIR! between aging party co-op games and serious firefighting simulators;
  - Slide 16 text blocks and proof points stay inside the main slide frame;
  - Slide 16 now states that Dreadway was built and shipped with an almost-zero production budget, including a `~0 budget` proof point.
- Production roadmap:
  - MVP: September 2026 - January 2027;
  - first playtest: late February 2027;
  - Steam Next Fest demo: June 2027;
  - closed media/influencer playtest: July 2027;
  - Early Access / release target: September 2027.
- Scene-reactive canvas background motion:
  - sparks slides add brighter drifting embers;
  - water slides add faster warm streaks and mist;
  - smoke slides add slower smoky depth;
  - desktop animation is capped at 30 FPS, rendered at a reduced internal canvas resolution, and uses a lighter particle count without per-particle blur/shadow effects;
  - motion is disabled in mobile deck mode, `prefers-reduced-motion`, and PDF/export mode.

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

The current repository copy is intentionally edited directly for the live hidden publisher page. Do not assume it is synchronized with `D:\Documents\New project` unless that source deck is explicitly refreshed later.

The downloadable PDF currently uses the flat high-quality export:

`D:\Documents\New project\Exports\open_up_sir_pitch_deck_flat.pdf`

Mobile page images are generated from the latest rendered QA pages:

`D:\Documents\New project\Exports\qa\budget-positioning-update\pages\page-01.png` through `page-18.png`

They are stored as optimized JPEGs in:

`pitch/open-up-sir/assets/mobile-pages/`

## Update Flow

When the pitch deck changes:

1. Re-export the source HTML deck and PDF from `D:\Documents\New project`.
2. Copy the updated HTML/CSS/JS/assets into `pitch/open-up-sir/`.
3. Replace `pitch/open-up-sir/open-up-sir-pitch-deck.pdf` with the latest flat PDF.
4. Regenerate the `assets/mobile-pages/page-*.jpg` files from the latest QA page renders.
5. Re-apply or preserve the Slide 1 interactive trailer mini-preview, mute button, volume slider, and Proof Of Concept link if the source export does not include them.
6. Re-test desktop and mobile viewport rendering before publishing.
