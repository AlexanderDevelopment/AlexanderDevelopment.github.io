# Hero Branding

## Overview

The homepage hero in `index.html` is a single full-width branded stage instead of a split text-and-card layout. The main `ZweiBier Indie` heading now acts as a wordmark logo and stretches across the hero width on desktop.

## Implementation

- `index.html` loads the `Syne` display font from Google Fonts for brand wordmarks.
- `.hero-shell` widens the hero beyond the default site container so the wordmark can breathe.
- `.hero-card` now acts as the full hero stage with the featured artwork as a shared backdrop.
- `.hero-wordmark` uses two spans (`ZweiBier` and `Indie`) so the second line can align to the opposite side on wider screens.
- `.brand-wordmark` applies the same display font to the sticky header brand so the logo treatment stays consistent.

## Responsive Behavior

- On desktop, `ZweiBier` starts on the left and `Indie` aligns to the right edge of the wordmark block.
- On small screens, the second line snaps back to the left so the logo stays readable and does not feel forced.
- The old `Made by Alex` floating hero card is intentionally removed from the hero stage.

## Updating It

- Keep the two-span structure inside `.hero-wordmark` if you want to preserve the stretched logo composition.
- If the hero artwork changes, update the background image in `.hero-card::before`.
- If the brand font changes, update both the `<link>` tag in `<head>` and the `.brand-wordmark` / `.hero-wordmark` selectors together.
