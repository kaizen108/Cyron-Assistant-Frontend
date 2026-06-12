export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://api.cyronticket.com';

const runtimeOrigin =
  typeof window !== 'undefined' ? window.location.origin : undefined;

export const FRONTEND_BASE_URL =
  import.meta.env.VITE_FRONTEND_BASE_URL ?? runtimeOrigin ?? 'http://localhost:5173';

// Prefer the live browser origin so OAuth redirect always matches the deployed Vercel URL.
export const DISCORD_REDIRECT_URL =
  runtimeOrigin != null
    ? `${runtimeOrigin}/auth/callback`
    : import.meta.env.VITE_DISCORD_OAUTH_REDIRECT ??
      `${FRONTEND_BASE_URL}/auth/callback`;

export const TOKEN_STORAGE_KEY = 'cyron_token';

