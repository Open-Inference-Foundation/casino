/**
 * Shared constants for the Casino frontend.
 * Consolidates env-var-backed fallbacks so they're defined once.
 */

/** API base URL — reads from env, falls back to production default. */
export const API_BASE_URL =
  import.meta.env.VITE_FLOWSTACK_BASE_URL || 'https://sage-api.flowstack.fun';

/** Hosting domain suffix for Casino-built apps. */
export const HOSTING_DOMAIN =
  import.meta.env.VITE_CASINO_HOSTING_DOMAIN || 'casino.flowstack.fun';

/** Build a full subdomain URL from a site ID. */
export function siteUrl(siteId: string): string {
  return `https://${siteId}.${HOSTING_DOMAIN}`;
}
