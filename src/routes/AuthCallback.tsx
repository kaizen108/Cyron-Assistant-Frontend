import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAlert } from 'react-alert';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { getToken } from '../lib/storage';

const OAUTH_SESSION_PREFIX = 'cyron_oauth_code:';

function normalizeRedirectPath(redirect?: string): string {
  if (!redirect) return '/dashboard';
  if (redirect.startsWith('http://') || redirect.startsWith('https://')) {
    try {
      return new URL(redirect).pathname || '/dashboard';
    } catch {
      return '/dashboard';
    }
  }
  return redirect.startsWith('/') ? redirect : `/${redirect}`;
}

function oauthSessionKey(code: string): string {
  return `${OAUTH_SESSION_PREFIX}${code}`;
}

export const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuthToken } = useAuth();
  const alert = useAlert();
  const [error, setError] = useState<string | null>(null);
  const ranOnce = useRef(false);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const code = params.get('code');
  const state = params.get('state');
  const token = params.get('token');

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    async function finishAuth() {
      try {
        // Flow A: backend already redirected here with ?token=...
        if (token) {
          await setAuthToken(token);
          navigate('/dashboard', { replace: true });
          return;
        }

        // Flow B: Discord redirected here with ?code=...&state=...
        if (code && state) {
          const sessionKey = oauthSessionKey(code);

          // Already completed (e.g. React StrictMode remount or page refresh)
          if (sessionStorage.getItem(sessionKey) === 'done') {
            if (getToken()) {
              navigate('/dashboard', { replace: true });
              return;
            }
          }

          // Another in-flight request is handling this code
          if (sessionStorage.getItem(sessionKey) === 'pending') {
            for (let i = 0; i < 30; i++) {
              await new Promise((r) => setTimeout(r, 200));
              if (sessionStorage.getItem(sessionKey) === 'done' && getToken()) {
                navigate('/dashboard', { replace: true });
                return;
              }
            }
          }

          sessionStorage.setItem(sessionKey, 'pending');

          const res = await api.post<{ token: string; redirect?: string }>(
            '/auth/callback',
            null,
            {
              params: { code, state },
              timeout: 60_000,
            },
          );

          if (!res.data?.token) {
            throw new Error('Missing token in auth response');
          }

          await setAuthToken(res.data.token);
          sessionStorage.setItem(sessionKey, 'done');
          navigate(normalizeRedirectPath(res.data.redirect), { replace: true });
          return;
        }

        // Token may exist from a prior successful exchange while UI showed an error
        if (getToken()) {
          navigate('/dashboard', { replace: true });
          return;
        }

        const msg = 'Missing OAuth parameters. Please try signing in again.';
        setError(msg);
        alert.error(msg);
      } catch (err) {
        // If login actually succeeded but navigation failed, recover gracefully
        if (getToken()) {
          if (code) sessionStorage.setItem(oauthSessionKey(code), 'done');
          navigate('/dashboard', { replace: true });
          return;
        }
        if (code) sessionStorage.removeItem(oauthSessionKey(code));

        const msg = 'Something went wrong during authentication. Please try again.';
        setError(msg);
        alert.error(msg);
      }
    }

    void finishAuth();
  }, [alert, code, navigate, setAuthToken, state, token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="rounded-2xl bg-white px-6 py-5 shadow-soft"
      >
        <p className="text-sm text-text-muted">
          {error ? 'Login failed. Please try again.' : 'Finishing sign-in with Discord...'}
        </p>
      </motion.div>
    </div>
  );
};
