export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export const FRONTEND_BASE_URL =
  import.meta.env.VITE_FRONTEND_BASE_URL ??
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173');

export const DISCORD_REDIRECT_URL =
  import.meta.env.VITE_DISCORD_OAUTH_REDIRECT ??
  `${FRONTEND_BASE_URL}/auth/callback`;

export const DISCORD_BOT_INVITE_URL =
  import.meta.env.VITE_DISCORD_BOT_INVITE_URL ??
  'https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&integration_type=0&scope=applications.commands+bot';

export const TOKEN_STORAGE_KEY = 'cyron_token';

