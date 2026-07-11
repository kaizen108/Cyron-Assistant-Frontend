import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAlert } from 'react-alert';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';

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
          setAuthToken(token);
          navigate('/dashboard', { replace: true });
          return;
        }

        // Flow B: Discord redirected here with ?code=...&state=...
        if (code && state) {
          const res = await api.post<{ token: string; redirect?: string }>(
            '/auth/callback',
            null,
            { params: { code, state } },
          );
          setAuthToken(res.data.token);
          navigate(res.data.redirect ?? '/dashboard', { replace: true });
          return;
        }

        const msg = 'Missing OAuth parameters. Please try signing in again.';
        setError(msg);
        alert.error(msg);
      } catch {
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
