# dreadway.github.io

Static landing page for ZweiBier Indie.

## Discord Community Section

- The homepage includes a custom Discord section at `#discord`.
- Invite URL: `https://discord.gg/sredy7UU63`
- The HTML renders fallback server stats so the block is always populated.
- `index.html` also tries to refresh the member and online counts from Discord's public invite endpoint when the browser allows that request.
- If the invite code changes, update both the `data-discord-invite` attribute and the Discord CTA links in `index.html`.
