# Site Motion

## Overview

The homepage uses a fixed decorative backdrop, lightweight ambient canvas motion, click feedback, and scroll-triggered section motion to add depth without relying on heavy parallax.

## Implementation

- `index.html` adds fixed `.page-backdrop`, `.atmosphere-canvas`, `.noise`, `.signal-line`, and `.click-burst-layer` layers behind or above the content.
- `initializeAtmosphereCanvas()` renders slow ambient particles and subtle connection lines on `.atmosphere-canvas`. Particle count is capped and reduced on coarse pointer devices.
- `initializeClickBursts()` adds short pointer click bursts to `.click-burst-layer`. It ignores form fields and automatically removes each burst after its animation completes.
- `.signal-line` is a fixed decorative SVG line near the top of the viewport. It uses CSS dash/drift animation and does not require JavaScript.
- Elements marked with `.scroll-reveal` fade in and lift into place when they enter the viewport.
- Elements marked with `.scroll-depth` also receive a scroll-driven vertical shift and scale change: panels below the viewport center grow, while panels moving above the center shrink.
- `initializeScrollMotion()` alternates `.scroll-reveal` blocks between left-side and right-side entry classes.
- `initializeScrollMotion()` also marks key text, image, trailer showcase, and content groups as `.motion-piece` so panels assemble from staggered left/right child motion.
- The games section uses `.game-showcase` as the scroll-revealed panel. Its `.game-preview-media` receives the same depth-aware entrance motion as the older artwork carousel background.
- When a revealed block scrolls out through the top of the viewport, `initializeScrollMotion()` applies `.is-leaving-up` so the panel shrinks, fades, clips inward, and its `.motion-piece` children split back out to the sides.
- `initializeScrollMotion()` handles reveal state, upward exit state, split-piece setup, and the depth updates with `requestAnimationFrame`.

## Accessibility

- Motion is disabled when the browser reports `prefers-reduced-motion: reduce`. The canvas and click burst layers are hidden, signal-line and wordmark animations are stopped, and scroll reveal elements are shown without transitions.
- The page keeps working without JavaScript because the hidden state is only activated when the `motion-ready` class is added to `<html>`.
- The canvas is decorative only and marked with `aria-hidden="true"`.

## Extending It

- Add `.scroll-reveal` to any new section or card that should animate into view.
- Add `.scroll-depth` plus `data-depth="12"` to `data-depth="24"` for elements that need a stronger depth effect.
- Add `data-reveal-side="left"` or `data-reveal-side="right"` when a block should enter from a specific side instead of using the automatic alternating pattern.
- If a new panel needs internal assembly motion, add its key child selectors to `prepareMotionPieces()` in `index.html`.
- For the games showcase, keep `.game-tab`, `.game-preview-media`, `.game-preview-copy`, `.game-meta`, and `.game-preview-actions` selectors in `prepareMotionPieces()` so project switching and scroll reveals stay visually consistent.
- Keep the strongest depth values for large panels only so mobile scrolling stays smooth.
- Tune ambient density in `initializeAtmosphereCanvas()` with the `density`, `minCount`, and `maxCount` values. Keep mobile/coarse pointer caps conservative.
- Add new click burst styling in `.click-burst` and `.click-burst span`; do not attach extra per-click listeners to individual buttons.
- Keep the signal-line SVG abstract and brand-neutral. Change the path data or stroke colors rather than copying another site's exact line artwork.
