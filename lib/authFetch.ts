/**
 * Client-side helper for calling our own authenticated API routes. Convex Auth's
 * WebSocket-based ConvexReactClient handles auth automatically for useQuery/useMutation,
 * but plain fetch() calls to our Next.js API routes (pages/api/*) need the JWT attached
 * explicitly as a Bearer token — get it via `useAuthToken()` and pass it in here.
 */
export function authFetch(token: string | null, input: string, init: RequestInit = {}): Promise<Response> {
  return fetch(input, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
