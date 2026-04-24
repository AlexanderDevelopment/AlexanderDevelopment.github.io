# dreadway.github.io

Static landing page for ZweiBier Indie.

## Documentation

- Motion and fixed background notes: `Docs/site-motion.md`

## Discord Community Section

- The homepage includes a custom Discord section at `#discord`.
- Invite URL: `https://discord.gg/sredy7UU63`
- The Discord preview is blocked by default and only loads after the visitor explicitly allows Discord content.
- The site remembers that choice in local browser storage under `zb-discord-preview-consent`.
- Once consent is granted, the card shows loading placeholders and then requests live member and online counts from Discord's public invite endpoint.
- If Discord does not return live data, both counters switch to `Unavailable` instead of showing stale hardcoded values.
- If the invite code changes, update both the `data-discord-invite` attribute and the Discord CTA links in `index.html`.
- If the default server icon changes, update the `data-icon-url` attribute on `#discord-icon` in `index.html`.
