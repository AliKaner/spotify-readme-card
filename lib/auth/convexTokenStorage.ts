import type { TokenStorage } from "@convex-dev/auth/react";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function isSecureContext(): boolean {
  return typeof window !== "undefined" && window.location.protocol === "https:";
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string): void {
  const secure = isSecureContext() ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

function removeCookie(name: string): void {
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

/**
 * Convex Auth's browser storage defaults to localStorage, which server-side code
 * (getServerSideProps, API routes) can never read. We're on the Pages Router, which has
 * no framework-level bridge for this (that only exists for App Router via
 * `@convex-dev/auth/nextjs`), so this implements the documented `TokenStorage` extension
 * point ourselves, backed by a plain cookie — the same JWT is then readable both by the
 * client and by SSR/API-route requests. Trade-off: the cookie must be JS-writable, so it
 * can't be httpOnly (unlike next-auth's default session cookie).
 */
export const cookieTokenStorage: TokenStorage = {
  getItem(key) {
    if (typeof document === "undefined") return null;
    return readCookie(key);
  },
  setItem(key, value) {
    if (typeof document === "undefined") return;
    writeCookie(key, value);
  },
  removeItem(key) {
    if (typeof document === "undefined") return;
    removeCookie(key);
  },
};
