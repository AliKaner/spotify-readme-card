# 🎧 Spotify README Card

**Live, embeddable SVG widgets for your GitHub profile README** — shows what you're currently (or last) playing on Spotify, and your top tracks. Self-hosted on Vercel, no third-party service in the middle of your data.

[![License: MIT](https://img.shields.io/badge/license-MIT-1db954.svg)](LICENSE)
[![Built with Next.js](https://img.shields.io/badge/built%20with-Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AliKaner/spotify-readme-card&env=SPOTIFY_CLIENT_ID,SPOTIFY_CLIENT_SECRET,SPOTIFY_REFRESH_TOKEN&envDescription=Spotify%20API%20credentials%20required%20to%20read%20your%20listening%20activity)

> Similar in spirit to [Novatorem](https://github.com/novatorem/novatorem), rebuilt from scratch with a now-playing card, a recently-played fallback, a top-tracks card, and multiple color themes.

---

## Preview

```md
[![Spotify](https://your-deployment.vercel.app/api/spotify)](https://your-deployment.vercel.app)
```

```md
![Top Tracks](https://your-deployment.vercel.app/api/top-tracks)
```

Replace `your-deployment.vercel.app` with your own domain once deployed (see below).

## Features

- **Now Playing card** — shows the track currently playing, with an animated equalizer
- **Recently Played fallback** — when nothing is playing, shows the last track you listened to
- **Top Tracks card** — your top 5 (configurable) tracks for the last 4 weeks / 6 months / all time
- **5 built-in themes** — `default`, `light`, `dracula`, `ocean`, `midnight` — switch via a query param
- **No external image proxy** — album art is embedded directly into the SVG as a data URI
- **Zero database** — credentials live in environment variables, tokens are refreshed on every request
- MIT licensed, ~zero-config fork & deploy

## Quick start

1. **Fork this repository.**
2. **Create a Spotify app** at the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and grab the **Client ID** and **Client Secret**.
3. **Get a refresh token** (one-time, local):

   ```bash
   npm install
   SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=xxx npm run get-refresh-token
   ```

   This opens a Spotify authorization URL in your terminal — visit it, approve access, and the script prints your `SPOTIFY_REFRESH_TOKEN`. Before running it, add `http://127.0.0.1:8888/callback` as a Redirect URI in your Spotify app settings (Dashboard → your app → *Edit Settings*).

4. **Deploy to Vercel** — click the button above, or run `vercel`, and set these environment variables in your project settings:

   | Variable | Description |
   |---|---|
   | `SPOTIFY_CLIENT_ID` | From your Spotify app |
   | `SPOTIFY_CLIENT_SECRET` | From your Spotify app |
   | `SPOTIFY_REFRESH_TOKEN` | From step 3 |
   | `NEXT_PUBLIC_SITE_URL` | *(optional)* your deployed URL, used for SEO/social meta tags |

5. **Embed it** in your GitHub profile README:

   ```md
   [![Spotify](https://YOUR-DEPLOYMENT.vercel.app/api/spotify)](https://YOUR-DEPLOYMENT.vercel.app)
   ```

## Local development

```bash
npm install
cp .env.example .env.local   # fill in your credentials
npm run dev
```

Visit `http://localhost:3000` for a live preview, or `http://localhost:3000/api/spotify` directly for the raw SVG.

## API reference

Every query param below is optional — omit it to get the default. Both endpoints share the same `theme` param and can be mixed and matched freely.

### Themes

| `theme` value | Accent | Background |
|---|---|---|
| `default` | `#1db954` (Spotify green) | `#191414` (near-black) |
| `light` | `#1db954` (Spotify green) | `#ffffff` (white) |
| `dracula` | `#ff79c6` (pink) | `#282a36` (Dracula gray) |
| `ocean` | `#38bdf8` (sky blue) | `#0f172a` (navy) |
| `midnight` | `#f5a623` (amber) | `#0d0d0d` (black) |

### `GET /api/spotify`

Now playing, falling back to last played if nothing's active.

| Param | Values | Default | Description |
|---|---|---|---|
| `theme` | `default` \| `light` \| `dracula` \| `ocean` \| `midnight` | `default` | Color theme, see table above |

Examples:

```md
[![Spotify](https://your-deployment.vercel.app/api/spotify)](https://your-deployment.vercel.app)
[![Spotify](https://your-deployment.vercel.app/api/spotify?theme=dracula)](https://your-deployment.vercel.app)
[![Spotify](https://your-deployment.vercel.app/api/spotify?theme=ocean)](https://your-deployment.vercel.app)
```

### `GET /api/top-tracks`

| Param | Values | Default | Description |
|---|---|---|---|
| `theme` | `default` \| `light` \| `dracula` \| `ocean` \| `midnight` | `default` | Color theme, see table above |
| `time_range` | `short_term` \| `medium_term` \| `long_term` | `short_term` | `short_term` ≈ last 4 weeks, `medium_term` ≈ last 6 months, `long_term` ≈ all time |
| `limit` | `1`–`10` | `5` | Number of tracks shown (out-of-range values are clamped) |

Examples:

```md
![Top Tracks](https://your-deployment.vercel.app/api/top-tracks)
![Top Tracks](https://your-deployment.vercel.app/api/top-tracks?theme=dracula&time_range=long_term&limit=8)
![Top Tracks](https://your-deployment.vercel.app/api/top-tracks?theme=midnight&time_range=medium_term&limit=3)
```

## Why does the widget sometimes look stale?

GitHub proxies external images through its own cache (camo), so an embedded README image doesn't refetch on every page view. This is expected and affects every project of this kind — the SVG itself is always generated fresh per request, but GitHub's cache decides how often it actually re-fetches.

## Project structure

```
lib/
  spotify.ts          Spotify API client (token refresh, now playing, top tracks)
  image.ts            Album art → base64 data URI
  text.ts             Text width estimation / truncation for SVG <text>
  themes.ts           Color theme presets
  cards/
    nowPlayingCard.ts  Now playing / last played SVG
    topTracksCard.ts   Top tracks SVG
pages/
  index.tsx           Landing page / live preview
  api/
    spotify.ts         GET /api/spotify
    top-tracks.ts       GET /api/top-tracks
scripts/
  get-refresh-token.js One-time OAuth helper to obtain a refresh token
```

## Contributing

Issues and PRs are welcome — new themes, layout tweaks, and additional endpoints (playlists, artists, etc.) are all good fits. Since this project is meant to be forked and self-hosted, please keep new features config-driven via query params or environment variables rather than hardcoding personal data.

## License

[MIT](LICENSE) — do whatever you want with it, including running your own fork.

---

<sub>Keywords: spotify github readme widget, spotify now playing github, github profile spotify card, spotify svg badge, readme stats generator, self-hosted spotify widget, novatorem alternative.</sub>
