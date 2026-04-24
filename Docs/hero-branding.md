# Hero Branding

## Overview

The homepage hero in `index.html` is a single full-width branded stage instead of a split text-and-card layout. The main `ZweiBier Indie` heading now acts as a single-line wordmark with a softer neon-green glow instead of the older split two-line composition.

## Implementation

- `index.html` loads the `Space Grotesk` display font from Google Fonts for the brand wordmarks.
- `.hero-shell` widens the hero beyond the default site container on desktop, then switches to explicit inline padding on smaller screens to keep the hero frame balanced on both sides.
- `.hero-card` now acts as the full hero stage with a neutral atmospheric haze backdrop built from layered gradients.
- `.hero-wordmark` is a single text node (`ZweiBier Indie`) with a light green fill, black stroke, and layered glow for a cleaner logo treatment.
- `.brand-wordmark` uses the same font family in the sticky header, but with a much lighter glow so the nav stays readable.

## Responsive Behavior

- On desktop, the single-line wordmark scales up aggressively while staying on one line.
- On small screens, the font size and stroke width step down so the wordmark still fits comfortably without wrapping.
- On small screens, `.hero-shell` uses inline padding instead of width math so the hero border and background do not appear clipped on the right edge.
- The old `Made by Alex` floating hero card is intentionally removed from the hero stage.

## Updating It

- Keep the hero wordmark as a plain text node if you want to preserve the cleaner one-line logo treatment.
- If the hero mood needs to change, update the gradient stack in `.hero-card::before` instead of dropping in game art behind the logo.
- If the brand font changes, update both the `<link>` tag in `<head>` and the `.brand-wordmark` / `.hero-wordmark` selectors together.
