# 🧩 README Card Marketplace

**Connect your accounts, build a live SVG card, and drop it straight into your GitHub profile README.** Started as a Spotify-only widget, now a small multi-tenant marketplace: sign in with GitHub, connect a service (Spotify today, more later), pick a card type and theme, and get a stable public URL to embed.

[![License: MIT](https://img.shields.io/badge/license-MIT-1db954.svg)](LICENSE)
[![Built with Next.js](https://img.shields.io/badge/built%20with-Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![Backend: Convex](https://img.shields.io/badge/backend-Convex-EE342F)](https://convex.dev)

---

## How it works

1. Sign in with GitHub.
2. Connect a service from your dashboard (Spotify today — more integrations are planned, see the marketplace list on the homepage).
3. Create a card: pick a card type (Now Playing / Top Tracks), a theme, and a couple of type-specific options.
4. Copy the embed snippet into your GitHub README:

   ```md
   [![Spotify](https://your-deployment.vercel.app/api/card/<publicId>)](https://your-deployment.vercel.app)
   ```

Every card is served by `GET /api/card/[publicId]` — a public, unauthenticated endpoint that always renders a fresh SVG for that card's owner and settings, keyed by a card id instead of personal env vars.

## Features

- **Multi-tenant** — anyone can sign in, connect their own Spotify account, and get their own cards; no forking required
- **Now Playing card** — currently playing track with an animated equalizer, falling back to last played
- **Top Tracks card** — top 5 (configurable) tracks for the last 4 weeks / 6 months / all time
- **5 built-in themes** — `default`, `light`, `dracula`, `ocean`, `midnight`
- **No external image proxy** — album art is embedded directly into the SVG as a data URI
- **Tokens encrypted at rest** — AES-256-GCM, never stored or logged in plaintext
- **Extensible provider system** — adding a new integration means implementing one `Provider` interface, not rearchitecting

## Tech stack

- Next.js (Pages Router) + TypeScript
- [Convex](https://convex.dev) — database (`User`/`Connection`/`Card`) and, via [Convex Auth](https://labs.convex.dev/auth), GitHub login
- Hand-rolled OAuth for provider connections (Spotify today), kept separate from login

> **Heads up — Convex Auth on the Pages Router:** `@convex-dev/auth` is beta and its
> official Next.js integration targets the App Router only. This project deliberately
> stays on the Pages Router, so the auth bridge into `getServerSideProps`/API routes
> (`lib/auth/convexTokenStorage.ts`, `lib/auth/convexSession.ts`) is custom, cookie-based
> code, not a supported framework feature. See the comments in those two files before
> touching auth — there's a known edge case where a request can read a just-expired JWT
> from the cookie and bounce to `/signin` even though the user has a valid session.

## Local development

### 1. Prerequisites

- A [Convex](https://convex.dev) account (free) — `npx convex dev` handles login.
- A **GitHub OAuth App** ([create one](https://github.com/settings/developers)) — homepage URL your app's origin; **callback URL must point at your Convex deployment**, not your Next.js app: `https://<your-deployment>.convex.site/api/auth/callback/github` (the exact subdomain is only known after step 2 below — come back and fill this in).
- A **Spotify app** ([Spotify Developer Dashboard](https://developer.spotify.com/dashboard)) — add `http://localhost:3000/api/connect/spotify/callback` as a Redirect URI.

### 2. Set up Convex + Convex Auth

```bash
npm install
npx convex dev            # interactive: log in, create/select a project
                           # writes CONVEX_DEPLOYMENT / NEXT_PUBLIC_CONVEX_URL to .env.local
npx @convex-dev/auth --web-server-url http://localhost:3000
                           # generates convex/auth.ts, auth.config.ts, http.ts,
                           # and sets SITE_URL / JWT_PRIVATE_KEY / JWKS on the deployment
```

Now go back to your GitHub OAuth App and set the real callback URL using the deployment name printed above (also visible as `NEXT_PUBLIC_CONVEX_SITE_URL` in `.env.local`), then set the GitHub credentials on Convex (not in `.env.local`):

```bash
npx convex env set AUTH_GITHUB_ID <client id>
npx convex env set AUTH_GITHUB_SECRET <client secret>
```

### 3. Configure the remaining environment variables

```bash
cp .env.example .env.local   # if you haven't already — fill in Spotify creds
```

Generate the two local secrets:

```bash
openssl rand -base64 32   # TOKEN_ENCRYPTION_KEY
openssl rand -base64 32   # OAUTH_STATE_SECRET
```

### 4. Run it

```bash
npm run dev
```

Visit `http://localhost:3000`, sign in with GitHub, connect Spotify from `/dashboard`, and create your first card from `/dashboard/cards/new`.

## Deploying

1. Push this repo to your own GitHub account and import it into Vercel.
2. Run `npx convex deploy` (or configure the [Vercel + Convex integration](https://docs.convex.dev/production/hosting/vercel)) to get a production Convex deployment, and set its `AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET`/`SITE_URL` via `npx convex env set ... --prod`.
3. Update your GitHub OAuth App and Spotify app redirect URIs to point at your production Convex deployment / Vercel domain instead of `localhost`.
4. Set the Next.js-side environment variables from `.env.example` in your Vercel project settings.

## API reference

### `GET /api/card/[publicId]`

Public, unauthenticated. Renders the SVG for that card using its owner's connected account, current theme, and config. Cache duration depends on the card type (now-playing refreshes almost immediately; top-tracks is cached for an hour). Returns a graceful fallback SVG on any error instead of a broken image.

### `GET /api/connect/spotify`

Authenticated. Redirects to Spotify's OAuth consent screen to link (or relink) your Spotify account.

### `POST /api/cards`

Authenticated. Creates a card: `{ provider, type, theme, config }`. Validated against the provider's card-type schema; requires the provider to already be connected.

### `DELETE /api/cards/[id]`

Authenticated, ownership-checked (in the Convex mutation itself). Deletes a card and invalidates its public URL.

## Adding a new provider

Providers live in `lib/providers/`. Each one implements the `Provider` interface from `lib/providers/types.ts` (card types + config schemas + a `renderCard` function) and is registered in `lib/providers/registry.ts`. The Spotify implementation in `lib/providers/spotify/index.ts` is the reference example — it's a thin wrapper around `lib/spotify.ts` (API calls) and the existing card builders in `lib/cards/*` (which only ever needed data + a theme, so they're untouched by any of this).

## Project structure

```
convex/
  schema.ts               User (from Convex Auth) / Connection / Card tables
  auth.ts, auth.config.ts, http.ts   Convex Auth config (GitHub provider)
  connections.ts           Connection queries/mutations
  cards.ts                 Card queries/mutations
  users.ts                 Current-user lookup
lib/
  spotify.ts              Spotify API client + OAuth (authorize URL, code exchange, token refresh)
  connections.ts          Per-connection access-token freshness (refresh + persist when expired)
  crypto.ts               AES-256-GCM helpers for encrypting stored tokens
  oauthState.ts           Signed, stateless CSRF state for provider connect flows
  convexClient.ts         Per-request ConvexHttpClient factory
  env.ts                  Site URL resolution
  image.ts                Album art → base64 data URI
  text.ts                 Text width estimation / truncation for SVG <text>
  themes.ts               Color theme presets
  auth/
    convexTokenStorage.ts  Custom cookie-backed TokenStorage for Convex Auth (client-side)
    convexSession.ts        Cookie → authenticated ConvexHttpClient bridge (server-side)
    requireConvexSession.ts  getServerSideProps guard built on convexSession
  providers/
    types.ts              Provider interface
    registry.ts             Provider registry + marketplace listing
    spotify/index.ts         Spotify Provider implementation
pages/
  index.tsx               Marketplace landing page
  signin.tsx              GitHub sign-in page
  dashboard/
    index.tsx              Connection status + connect buttons
    cards/index.tsx         List cards, embed snippets, delete
    cards/new.tsx            Create a card
  api/
    connect/spotify.ts       Start Spotify OAuth
    connect/spotify/callback.ts  Spotify OAuth callback
    cards/index.ts           List/create cards
    cards/[id].ts             Delete a card
    card/[publicId].ts        Public SVG endpoint
```

## Why does the widget sometimes look stale?

GitHub proxies external images through its own cache (camo), so an embedded README image doesn't refetch on every page view. This is expected — the SVG itself is always generated fresh per request, but GitHub's cache decides how often it actually re-fetches.

## Contributing

Issues and PRs are welcome — new provider integrations (WakaTime, Last.fm, GitHub stats, etc.), new themes, and layout tweaks are all good fits. A visual, layered card builder is planned as a follow-up to the current preset-based creation flow.

## License

[MIT](LICENSE) — do whatever you want with it, including running your own fork.

---

<sub>Keywords: github readme widget marketplace, spotify github readme, github profile card generator, readme stats, self-hosted github widgets, spotify now playing github.</sub>
