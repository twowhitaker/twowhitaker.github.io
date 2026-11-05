# TwoWhit’s Tots — dynamic server widget

A Vite + React server card built from the Nov. 3, 2026 Discord snapshot and the public Discord widget API. The compact card is the single supported layout.

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

Discord's public widget API cannot expose Smash Arenas state, role counts, your tournament panel, TikTok LIVE state, or other bot-owned data. To make those pieces truly live, expose a small **public read-only JSON endpoint** from one of your existing bots / a Cloudflare Worker / another backend.

Copy `.env.example` to `.env` and set:

```env
VITE_COMMUNITY_STATUS_URL=https://your-domain.example/twowhit-status.json
```

The endpoint may return all or only some of the fields shown in:

`public/examples/community-status.json`

Any missing value automatically falls back to the snapshot.

### Important security note

Never put a Discord bot token, Render API key, or any other secret in a `VITE_*` variable. Vite variables are shipped to the browser. The status URL should expose only public, read-only data and handle secrets server-side.

The status endpoint must also allow CORS from wherever this widget is hosted.

## Embedding

For a transparent iframe-friendly page, add:

```text
?embed=1
```

Example:

```html
<iframe
  src="https://your-site.example/?embed=1"
  title="TwoWhit’s Tots"
  style="width: 520px; max-width: 100%; height: 650px; border: 0;"
></iframe>
```

The exact height can vary slightly when a live voice row is visible.
