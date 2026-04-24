# Discord Community

The homepage Discord section is a consent-gated community card that links visitors to the public server invite:

- Invite URL: `https://discord.gg/sredy7UU63`
- Invite code used for live requests: `sredy7UU63`
- Section anchor: `#discord`

## Live Counts

- The member and online counters are `live-only`.
- Before Discord responds, both counters render `...`.
- After consent is granted, `index.html` requests `https://discord.com/api/v10/invites/sredy7UU63?with_counts=true`.
- The UI uses `approximate_member_count` and `approximate_presence_count` from that public invite response.
- If Discord does not answer or does not provide counts, the UI shows `Unavailable` instead of stale hardcoded numbers.

## Update Checklist

- If the invite changes, update the `data-discord-invite` attribute on `#discord`.
- Update the `discord.gg/...` link in the Discord section CTA button.
- If the server icon changes and you want the default preview image to match before the live request finishes, update `data-icon-url` on `#discord-icon`.
