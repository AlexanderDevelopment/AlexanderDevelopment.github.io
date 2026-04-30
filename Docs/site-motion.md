# Site Motion

## Overview

The homepage uses a fixed decorative backdrop and scroll-triggered motion to add depth without relying on heavy parallax.

## Implementation

- `index.html` adds a fixed `.page-backdrop` layer behind all content.
- Elements marked with `.scroll-reveal` fade in and lift into place when they enter the viewport.
- Elements marked with `.scroll-depth` also receive a scroll-driven vertical shift and scale change: panels below the viewport center grow, while panels moving above the center shrink.
- `initializeScrollMotion()` alternates `.scroll-reveal` blocks between left-side and right-side entry classes.
- `initializeScrollMotion()` also marks key text, image, and content groups as `.motion-piece` so panels assemble from staggered left/right child motion.
- `initializeScrollMotion()` handles the reveal observer, split-piece setup, and the depth updates with `requestAnimationFrame`.

## Accessibility

- Motion is disabled when the browser reports `prefers-reduced-motion: reduce`.
- The page keeps working without JavaScript because the hidden state is only activated when the `motion-ready` class is added to `<html>`.

## Extending It

- Add `.scroll-reveal` to any new section or card that should animate into view.
- Add `.scroll-depth` plus `data-depth="12"` to `data-depth="24"` for elements that need a stronger depth effect.
- Add `data-reveal-side="left"` or `data-reveal-side="right"` when a block should enter from a specific side instead of using the automatic alternating pattern.
- If a new panel needs internal assembly motion, add its key child selectors to `prepareMotionPieces()` in `index.html`.
- Keep the strongest depth values for large panels only so mobile scrolling stays smooth.
