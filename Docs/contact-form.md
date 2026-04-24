# Contact Form

## Overview

The homepage contact form in `index.html` submits to the Formspree endpoint `https://formspree.io/f/mbdqwpyg` with JavaScript `fetch`, so visitors stay on `zweibier-indie.de` until the request is accepted.

## Files

- `index.html` contains the form markup, the Formspree endpoint, and the client-side anti-abuse checks.
- `contact-success.html` is the local success page after a completed submission.
- `privacy-policy.html` documents the third-party processing used by the form.

## Abuse Protection

- Formspree form ID endpoint keeps the destination inbox out of the public HTML.
- `_gotcha` honeypot catches simple bots.
- The homepage script rejects submissions sent in under 4 seconds.
- Messages shorter than 20 characters are blocked.
- Messages with more than 2 links are blocked.
- The submit button is locked while the request is in flight to reduce duplicate sends.

## Changing Provider

If the form provider changes again, update the endpoint and AJAX handling in `index.html`, adjust the legal wording in `privacy-policy.html`, and keep this note in sync.
