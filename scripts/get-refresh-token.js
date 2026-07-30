#!/usr/bin/env node
/**
 * One-time local helper that walks through Spotify's Authorization Code
 * flow and prints a refresh token to store as SPOTIFY_REFRESH_TOKEN.
 *
 * Usage:
 *   SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... node scripts/get-refresh-token.js
 */
const http = require("http");
const { URL } = require("url");

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const PORT = 8888;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const SCOPES = ["user-read-currently-playing", "user-read-recently-played", "user-top-read"].join(" ");

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables before running this script.");
  process.exit(1);
}

const authUrl = new URL("https://accounts.spotify.com/authorize");
authUrl.searchParams.set("client_id", CLIENT_ID);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
authUrl.searchParams.set("scope", SCOPES);

console.log(`\n1. In your Spotify Dashboard app settings, add this Redirect URI:\n   ${REDIRECT_URI}\n`);
console.log(`2. Open this URL in your browser and approve access:\n\n   ${authUrl.toString()}\n`);
console.log("Waiting for the callback...\n");

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
  if (url.pathname !== "/callback") {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error || !code) {
    res.end(`Authorization failed: ${error ?? "no code returned"}. Check the terminal and try again.`);
    server.close();
    process.exit(1);
    return;
  }

  try {
    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = await tokenResponse.json();

    if (data.refresh_token) {
      console.log("Success! Add this to your .env.local / Vercel project settings:\n");
      console.log(`SPOTIFY_REFRESH_TOKEN=${data.refresh_token}\n`);
      res.end("Refresh token printed in your terminal. You can close this tab.");
    } else {
      console.error("Spotify did not return a refresh token:", data);
      res.end("Something went wrong — check the terminal for details.");
    }
  } catch (err) {
    console.error(err);
    res.end("Something went wrong — check the terminal for details.");
  } finally {
    server.close();
    process.exit(0);
  }
});

server.listen(PORT);
