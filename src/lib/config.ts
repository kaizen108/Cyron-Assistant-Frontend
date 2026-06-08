export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export const FRONTEND_BASE_URL =
  import.meta.env.VITE_FRONTEND_BASE_URL ?? window.location.origin;

export const DISCORD_REDIRECT_URL =
  import.meta.env.VITE_DISCORD_OAUTH_REDIRECT ??
  `${FRONTEND_BASE_URL}/auth/callback`;

export const TOKEN_STORAGE_KEY = 'cyron_token';

