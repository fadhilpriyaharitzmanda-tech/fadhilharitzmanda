import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import AdminDashboard from './AdminDashboard';
import './AdminDashboard.css';

const LegoLogo = ({ className = 'logo' }) => (
  <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
    <rect x="9" y="21" width="48" height="38" rx="4" fill="#141414" />
    <rect x="11" y="7" width="14" height="10" rx="2.5" fill="#b3121a" stroke="#141414" strokeWidth="3.5" />
    <rect x="31" y="7" width="14" height="10" rx="2.5" fill="#b3121a" stroke="#141414" strokeWidth="3.5" />
    <rect x="4" y="16" width="48" height="38" rx="4" fill="#b3121a" stroke="#141414" strokeWidth="4" />
    <path fill="#ffd500" d="M19 24h20v6H25v3h9v5h-9v9h-6z" />
  </svg>
);

export default function AdminGate({ onNavigateHome }) {
  // Status MUST initialize to 'loading' (never 'ok' or boolean)
  const [status, setStatus] = useState('loading'); // 'loading' | 'out' | 'denied' | 'ok'
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState('');

  // Check user session and verify admin status via RPC public.is_admin()
  const verifySession = async (session) => {
    if (!isSupabaseConfigured || !session?.user) {
      setCurrentUser(null);
      setStatus('out');
      return;
    }

    const user = session.user;
    setCurrentUser(user);

    try {
      // Call public.is_admin() - must strictly return true to proceed
      const { data, error } = await supabase.rpc('is_admin');

      // Fail closed: any error or non-true result leads to 'denied'
      if (error || data !== true) {
        console.warn('is_admin verification rejected (fail-closed):', error?.message || 'Not admin');
        if (error) {
          setAuthError(error.message);
        }
        setStatus('denied');
        return;
      }

      // Exactly true -> 'ok'
      localStorage.removeItem('admin_login_pending');
      sessionStorage.removeItem('admin_login_pending');
      setStatus('ok');
    } catch (err) {
      console.warn('Network or RPC exception in is_admin (fail-closed):', err);
      setAuthError(err?.message || 'Gagal memverifikasi status admin.');
      setStatus('denied');
    }
  };

  useEffect(() => {
    let isMounted = true;

    // 1. Initial check on mount
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (!isMounted) return;
        if (error) {
          console.warn('getSession error:', error.message);
          setStatus('out');
          return;
        }
        verifySession(session);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('getSession exception:', err);
        setStatus('out');
      });

    // 2. Auth state change listener
    // Wrap Supabase call in setTimeout(..., 0) to avoid deadlocks
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setTimeout(() => {
        if (!isMounted) return;
        verifySession(session);
      }, 0);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Action: Sign In with GitHub
  const handleLogin = async () => {
    setAuthError('');
    try {
      localStorage.setItem('admin_login_pending', 'true');
      sessionStorage.setItem('admin_login_pending', 'true');

      const redirectUrl = `${window.location.origin}/admin`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error('GitHub login error:', err);
      setAuthError(err.message || 'Gagal memulai login dengan GitHub.');
      localStorage.removeItem('admin_login_pending');
      sessionStorage.removeItem('admin_login_pending');
    }
  };

  // Action: Sign Out
  const handleLogout = async () => {
    try {
      localStorage.removeItem('admin_login_pending');
      sessionStorage.removeItem('admin_login_pending');
      await supabase.auth.signOut();
    } catch (err) {
      console.error('SignOut error:', err);
    } finally {
      setCurrentUser(null);
      setStatus('out');
    }
  };

  // 1. Status 'loading': Display loader indicator (never admin content)
  if (status === 'loading') {
    return (
      <div className="lego-admin-scope">
        <div className="lg">
          <div className="card">
            <LegoLogo />
            <h1>Admin Panel</h1>
            <p className="sub" style={{ marginTop: '12px' }}>
              Memverifikasi otentikasi & hak akses...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Status 'out': No active session, display GitHub login screen
  if (status === 'out') {
    return (
      <div className="lego-admin-scope">
        <div className="lg">
          <div className="card">
            <LegoLogo />
            <h1 style={{ fontSize: '1.6rem' }}>Admin</h1>
            <p className="sub" style={{ marginBottom: '22px' }}>
              Halaman ini khusus pemilik website. Masuk dengan akun GitHub yang terdaftar sebagai admin.
            </p>

            {authError && (
              <div className="er" style={{ marginBottom: '14px' }} role="alert">
                {authError}
              </div>
            )}

            <button
              type="button"
              className="btn"
              onClick={handleLogin}
              style={{ background: '#1c1c1c', width: '100%', justifyContent: 'center' }}
            >
              <svg className="i" viewBox="0 0 24 24" fill="currentColor">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              Masuk dengan GitHub
            </button>

            <div style={{ marginTop: '16px' }}>
              <button
                type="button"
                className="btn w"
                onClick={onNavigateHome}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Kembali ke Website
              </button>
            </div>

            <p className="note" style={{ marginTop: '16px' }}>
              Keamanan diverifikasi langsung oleh kebijakan RLS dan fungsi public.is_admin() di Supabase.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Status 'denied': Session exists, but RPC is_admin() returned false or failed
  if (status === 'denied') {
    const accountIdentifier =
      currentUser?.user_metadata?.user_name ||
      currentUser?.user_metadata?.name ||
      currentUser?.email ||
      'Pengguna';

    return (
      <div className="lego-admin-scope">
        <div className="lg">
          <div className="card">
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#ffd9db',
                border: '2px solid #b3121a',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 14px',
                color: '#b3121a',
              }}
            >
              <svg className="i" style={{ width: '32px', height: '32px' }} viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>

            <h1 style={{ fontSize: '1.6rem', color: '#b3121a' }}>Akses Ditolak</h1>
            <p className="sub" style={{ margin: '12px 0 20px' }}>
              Akun GitHub kamu (<b>{accountIdentifier}</b>) tidak terdaftar sebagai administrator.
            </p>

            {authError && (
              <div className="er" style={{ marginBottom: '14px' }} role="alert">
                {authError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                className="btn"
                onClick={handleLogout}
                style={{ justifyContent: 'center' }}
              >
                Keluar (Logout)
              </button>
              <button
                type="button"
                className="btn w"
                onClick={onNavigateHome}
                style={{ justifyContent: 'center' }}
              >
                Kembali ke Website
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Status 'ok': ONLY rendered if status is strictly 'ok'
  return (
    <AdminDashboard
      user={currentUser}
      onLogout={handleLogout}
      onNavigateHome={onNavigateHome}
    />
  );
}

