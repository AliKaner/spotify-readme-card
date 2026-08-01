// Convex Auth namespaces its storage keys as `${baseKey}_${escapedNamespace}`
// (escaped = non-alphanumeric chars stripped). We pin an explicit namespace here
// (passed to `storageNamespace` on `ConvexAuthProvider`) instead of the default
// deployment-URL-derived one, so the resulting cookie name is fixed and known —
// otherwise server-side code would have no reliable way to know what to look for.
export const CONVEX_AUTH_STORAGE_NAMESPACE = "app";
export const CONVEX_AUTH_JWT_COOKIE = `__convexAuthJWT_${CONVEX_AUTH_STORAGE_NAMESPACE}`;
