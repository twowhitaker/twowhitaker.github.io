# TwoWhit’s Tots — dynamic server widget

A Vite + React server card built from the Nov. 3, 2026 Discord snapshot and the public Discord widget API.

The package includes **two layouts** that share the same live data and configuration:

- **Full** — the richer landing-card version
- **Compact** — a shorter version with the same core identity, live status, Smash stats, features, and join CTA

## Run it

```bash
npm install
npm run dev
```

Build output goes to `docs/`:

```bash
npm run build
```

`vite.config.js` is intentionally configured with:

```js
base: ''
build: { outDir: 'docs' }
```

## Pick a layout

The default is **compact**.

You can change the project-wide default in `.env`:

```env
VITE_WIDGET_LAYOUT=compact
```

Accepted values are `full` and `compact`.

For easy comparison, the URL can override the default without rebuilding:

```text
?layout=full
?layout=compact
```

`?layout=condensed` is also accepted as an alias for compact.

For iframe use, combine it with embed mode:

```text
?embed=1&layout=full
?embed=1&layout=compact
```

That makes it easy to keep both versions deployed and decide which one you prefer from the embedding page.

## What is live with no backend

The app polls Discord's public widget JSON once per minute:

- server name
- current online/presence count
- anonymized online member avatars + status dots
- the widget's current invite URL
- TwoWhit's Discord presence when `twoWhitaker` appears in the widget
- active voice occupancy when widget members have `channel_id`

The app still works if that request fails; it falls back to values from the attached server snapshot.

## Snapshot-backed values

The current fallbacks are in `src/config.js`:

- 127 members
- 94 Tots
- 86 Smashers
- 20 Ultimate guide chapters
- 86 fighter guides
- top fighters: Bowser 18, Captain Falcon 13, Joker 13

Update those manually when you take a new snapshot, or use the optional status feed below.

## Optional richer live feed

Discord's public widget API cannot expose Play Desk state, role counts, your tournament panel, TikTok LIVE state, or other bot-owned data. To make those pieces truly live, expose a small **public read-only JSON endpoint** from one of your existing bots / a Cloudflare Worker / another backend.

Copy `.env.example` to `.env` and set:

```env
VITE_COMMUNITY_STATUS_URL=https://your-domain.example/twowhit-status.json
```

The endpoint may return all or only some of the fields shown in:

`public/examples/community-status.json`

Any missing value automatically falls back to the snapshot.

### Important security note

Never put a Discord bot token, Spotify secret, Render API key, or any other secret in a `VITE_*` variable. Vite variables are shipped to the browser. The status URL should expose only public, read-only data and handle secrets server-side.

The status endpoint must also allow CORS from wherever this widget is hosted.

## Embedding

Both layouts are responsive on their own. For a transparent iframe-friendly page, add:

```text
?embed=1
```

Full example:

```html
<iframe
  src="https://your-site.example/?embed=1&layout=full"
  title="TwoWhit’s Tots"
  style="width: 540px; max-width: 100%; height: 960px; border: 0;"
></iframe>
```

Compact example:

```html
<iframe
  src="https://your-site.example/?embed=1&layout=compact"
  title="TwoWhit’s Tots"
  style="width: 520px; max-width: 100%; height: 650px; border: 0;"
></iframe>
```

The exact height can vary slightly when a live voice row is visible.
