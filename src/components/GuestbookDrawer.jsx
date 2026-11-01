import React, { useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import './GuestbookDrawer.css';

const PALETTE = ['#b3121a', '#1f4fb4', '#1a9e4a', '#c77a00'];
const getAvatarColor = (name = '') => {
  const sum = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return PALETTE[sum % PALETTE.length];
};

const formatDate = (isoString) => {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

export default function GuestbookDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [messageText, setMessageText] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [isOtherModalOpen, setIsOtherModalOpen] = useState(false);

  // Ratings State (separated from comments)
  const [ratings, setRatings] = useState([]);
  const [userRating, setUserRating] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [isEditingRating, setIsEditingRating] = useState(false);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState('');

  const msgsContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const closeBtnRef = useRef(null);
  const triggerBtnRef = useRef(null);

  // Check if any other modal is active on page
  useEffect(() => {
    const checkModalState = () => {
      const hasModal =
        document.body.classList.contains('modal-open') ||
        document.querySelector('[data-lenis-prevent="true"]') !== null;
      setIsOtherModalOpen(hasModal && !isOpen);
    };

    const handleModalChange = (e) => {
      if (e.detail && typeof e.detail.isOpen === 'boolean') {
        setIsOtherModalOpen(e.detail.isOpen && !isOpen);
      } else {
        checkModalState();
      }
    };

    window.addEventListener('modal-state-change', handleModalChange);
    checkModalState();

    const observer = new MutationObserver(checkModalState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
      childList: true,
      subtree: true,
    });

    return () => {
      window.removeEventListener('modal-state-change', handleModalChange);
      observer.disconnect();
    };
  }, [isOpen]);

  // Auth state listener
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch comments from guestbook table
  const fetchMessages = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('guestbook')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Fetch messages error:', err);
      setErrorMsg('Gagal memuat pesan guestbook.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch ratings from guestbook_ratings table
  const fetchRatings = async () => {
    if (!isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from('guestbook_ratings')
        .select('user_id, rating');

      if (error) throw error;
      setRatings(data || []);
    } catch (err) {
      console.error('Fetch ratings error:', err);
    }
  };

  // Subscribe to realtime changes for both guestbook and guestbook_ratings
  useEffect(() => {
    fetchMessages();
    fetchRatings();

    if (!isSupabaseConfigured) return;

    const messagesChannel = supabase
      .channel('guestbook_messages_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'guestbook' },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    const ratingsChannel = supabase
      .channel('guestbook_ratings_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'guestbook_ratings' },
        () => {
          fetchRatings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(ratingsChannel);
    };
  }, []);

  // Sync current user's rating whenever user or ratings change
  useEffect(() => {
    if (user && ratings.length > 0) {
      const existing = ratings.find((r) => r.user_id === user.id);
      if (existing) {
        setUserRating(Number(existing.rating));
      } else {
        setUserRating(null);
      }
    } else if (!user) {
      setUserRating(null);
      setIsEditingRating(false);
    }
  }, [user, ratings]);

  // Auto scroll to bottom of messages container
  useEffect(() => {
    if (isOpen && msgsContainerRef.current) {
      setTimeout(() => {
        if (msgsContainerRef.current) {
          msgsContainerRef.current.scrollTop = msgsContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages, isOpen]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handle cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleOpen = () => {
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 150);
  };

  const handleClose = () => {
    setIsOpen(false);
    document.body.style.overflow = '';
    triggerBtnRef.current?.focus();
  };

  // Google & GitHub OAuth Login
  const handleLogin = async (provider) => {
    if (!isSupabaseConfigured) {
      setErrorMsg('Supabase belum dikonfigurasi. Harap isi file .env.local.');
      return;
    }
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
          queryParams:
            provider === 'google'
              ? {
                  access_type: 'offline',
                  prompt: 'select_account',
                }
              : undefined,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error('OAuth Login error:', err);
      setErrorMsg(err.message || 'Gagal memulai login OAuth.');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserRating(null);
      setIsEditingRating(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Save/Upsert rating to guestbook_ratings (1-5, single per user)
  const handleSaveRating = async (val) => {
    if (!user) {
      setRatingError('Anda harus login untuk memberi rating.');
      return;
    }
    try {
      setRatingSubmitting(true);
      setRatingError('');
      const { error } = await supabase
        .from('guestbook_ratings')
        .upsert(
          { user_id: user.id, rating: val },
          { onConflict: 'user_id' }
        );

      if (error) throw error;

      setUserRating(val);
      setIsEditingRating(false);
      await fetchRatings();
    } catch (err) {
      console.error('Error saving rating:', err);
      setRatingError(err.message || 'Gagal menyimpan rating.');
    } finally {
      setRatingSubmitting(false);
    }
  };

  // Insert comment to guestbook (WITHOUT rating column)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg('Silakan login terlebih dahulu.');
      return;
    }

    const trimmed = messageText.trim();
    if (!trimmed) {
      setErrorMsg('Pesan tidak boleh kosong.');
      return;
    }
    if (trimmed.length > 280) {
      setErrorMsg('Pesan maksimal 280 karakter.');
      return;
    }
    if (cooldown > 0) {
      setErrorMsg(`Tunggu ${cooldown} detik sebelum mengirim lagi.`);
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      // NOTE: Database trigger populates user_id, name, avatar_url, and provider.
      // Rating is NOT included here as rating column has been removed from guestbook.
      const { error } = await supabase.from('guestbook').insert([
        {
          message: trimmed,
        },
      ]);

      if (error) throw error;

      setMessageText('');
      setCooldown(10);
      await fetchMessages();
    } catch (err) {
      console.error('Insert message error:', err);
      setErrorMsg(err.message || 'Gagal mengirim pesan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus pesan ini dari guestbook?')) return;
    try {
      const { error } = await supabase.from('guestbook').delete().eq('id', id);
      if (error) throw error;
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Delete message error:', err);
      alert('Gagal menghapus pesan: ' + (err.message || 'Terjadi kesalahan.'));
    }
  };

  const getUserDisplayName = (u) => {
    if (!u) return 'Pengunjung';
    return (
      u.user_metadata?.full_name ||
      u.user_metadata?.name ||
      u.user_metadata?.user_name ||
      u.email?.split('@')[0] ||
      'Pengunjung'
    );
  };

  const getUserProvider = (u) => {
    if (!u) return 'GUEST';
    return (
      u.app_metadata?.provider ||
      u.user_metadata?.provider ||
      'OAUTH'
    ).toUpperCase();
  };

  // Rating Statistics
  const totalRatings = ratings.length;
  const avgRating =
    totalRatings > 0
      ? (
          ratings.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0) /
          totalRatings
        ).toFixed(1)
      : null;

  const isShown = !isOtherModalOpen;

  return (
    <aside className="gb-root" aria-label="Guestbook Widget">
      {/* Floating Action Button (FAB) at Bottom-Right */}
      <div
        className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 transition-all duration-500 ease-in-out ${
          isShown
            ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
            : 'opacity-0 translate-y-20 pointer-events-none scale-90'
        }`}
      >
        <button
          ref={triggerBtnRef}
          type="button"
          onClick={handleOpen}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label={`Buka Guestbook (${messages.length} pesan)`}
          className="gb-fab gb-st relative group"
        >
          {/* Pencil Icon */}
          <span className="material-symbols-outlined text-[20px] font-bold group-hover:rotate-12 transition-transform">
            edit_note
          </span>
          <span className="tracking-wide">Guestbook</span>
          <em>{messages.length}</em>
        </button>
      </div>

      {/* Backdrop Overlay */}
      <div
        className={`gb-ov ${isOpen ? 'open' : ''}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={`gb-dr ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gb-title"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <header className="gb-hd">
          <div className="gb-ttl" id="gb-title">
            <span>GUESTBOOK</span>
            <span className="gb-live">LIVE</span>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="gb-x"
            onClick={handleClose}
            aria-label="Tutup guestbook"
          >
            ESC &#10005;
          </button>
        </header>

        {/* Rating Summary Bar at Top of Panel */}
        <div className="gb-rating-bar" aria-label="Ringkasan Rating Portfolio">
          <div className="gb-rating-stat-left">
            <span className="gb-star-icon" aria-hidden="true">★</span>
            <span className="font-mono font-bold text-[1.1rem] text-[#141414]">
              {avgRating ? avgRating : '0.0'}
            </span>
            <span className="text-xs text-[#555] font-mono">
              / 5.0 ({totalRatings} {totalRatings === 1 ? 'ulasan' : 'ulasan'})
            </span>
          </div>
          <div className="gb-score-badge">
            <span>{avgRating ? `${avgRating} ★` : '★ -.-'}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
              {totalRatings > 0 ? 'Skor' : 'Belum Ada'}
            </span>
          </div>
        </div>

        {/* Configuration Notice if Supabase not set up */}
        {!isSupabaseConfigured && (
          <div className="bg-[#fff9db] border-b-4 border-[#141414] p-3 text-xs font-mono text-[#856404] flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#e3a008]">
              warning
            </span>
            <div>
              <strong>Setup Supabase:</strong> Tambahkan{' '}
              <code>VITE_SUPABASE_URL</code> dan{' '}
              <code>VITE_SUPABASE_ANON_KEY</code> di file <code>.env.local</code>{' '}
              agar fitur live guestbook aktif.
            </div>
          </div>
        )}

        {/* Auth Section */}
        <section className="gb-auth" aria-live="polite">
          {user ? (
            <div className="gb-meb">
              <span
                className="gb-av"
                style={{
                  margin: 0,
                  backgroundColor: getAvatarColor(getUserDisplayName(user)),
                }}
              >
                {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                  <img
                    src={user.user_metadata.avatar_url || user.user_metadata.picture}
                    alt={getUserDisplayName(user)}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  getUserDisplayName(user)[0]?.toUpperCase() || 'U'
                )}
              </span>
              <div className="flex flex-col">
                <span className="font-bold text-[0.92rem] text-[#141414]">
                  {getUserDisplayName(user)}
                </span>
                <span className="gb-pv text-xs w-max mt-0.5">
                  {getUserProvider(user)}
                </span>
              </div>
              <button
                type="button"
                className="gb-lo"
                onClick={handleLogout}
                title="Keluar dari akun"
              >
                Logout
              </button>
            </div>
          ) : (
            <div>
              <h3 className="gb-auth-ttl">
                <span className="gb-auth-dot" />
                Login untuk meninggalkan pesan & rating
              </h3>
              <div className="gb-lg-grid">
                {/* Google OAuth Button */}
                <button
                  type="button"
                  className="gb-ob google gb-st"
                  onClick={() => handleLogin('google')}
                  aria-label="Login dengan Google"
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                {/* GitHub OAuth Button */}
                <button
                  type="button"
                  className="gb-ob gb-st"
                  onClick={() => handleLogin('github')}
                  aria-label="Login dengan GitHub"
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Messages List */}
        <div
          ref={msgsContainerRef}
          className="gb-msgs"
          tabIndex={0}
          aria-label="Daftar pesan pengunjung"
        >
          {loading && (
            <div className="text-center py-8 font-mono text-sm text-[#555]">
              <span className="inline-block animate-bounce mr-2">🧱</span> Memuat pesan...
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="text-center py-10 px-4">
              <div className="text-3xl mb-2">💬</div>
              <p className="font-bold font-mono text-sm text-[#141414]">
                Belum ada pesan di Guestbook.
              </p>
              <p className="text-xs text-[#666] mt-1">
                Jadilah pengunjung pertama yang meninggalkan pesan & rating!
              </p>
            </div>
          )}

          {!loading &&
            messages.map((msg) => {
              const isOwn = Boolean(user && user.id && user.id === msg.user_id);
              const isDev = msg.provider === 'dev' || msg.name === 'Fadhil';
              const initial = msg.name ? msg.name[0]?.toUpperCase() : '?';

              return (
                <div
                  key={msg.id}
                  className={`gb-mrow ${isOwn ? 'own' : ''}`}
                >
                  {/* Avatar */}
                  <span
                    className="gb-av"
                    style={{
                      backgroundColor: msg.avatar_url
                        ? 'transparent'
                        : getAvatarColor(msg.name || 'Anonymous'),
                    }}
                  >
                    {msg.avatar_url ? (
                      <img
                        src={msg.avatar_url}
                        alt={msg.name || 'User'}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      initial
                    )}
                  </span>

                  {/* Message Content Container */}
                  <div className="gb-mc">
                    {/* Name + Provider Badge */}
                    <div className="gb-nm">
                      <span>{msg.name || 'Pengunjung'}</span>
                      <span className={`gb-pv ${isDev ? 'dev' : ''}`}>
                        {isDev ? 'DEV' : (msg.provider || 'USER').toUpperCase()}
                      </span>
                    </div>

                    {/* Message Bubble with LEGO Studs (Rating stars removed per user request) */}
                    <div className="gb-bb gb-st">
                      {/* XSS Safe Text Content via native React JSX escaping */}
                      <p>{msg.message}</p>
                    </div>

                    {/* Footer Info: Date + Delete for Owner */}
                    <div className="gb-ft">
                      <span>{formatDate(msg.created_at)}</span>
                      {isOwn && (
                        <button
                          type="button"
                          className="gb-del-btn"
                          onClick={() => handleDelete(msg.id)}
                          title="Hapus pesan milik Anda"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Composer Section */}
        <footer className="gb-cmp gb-st">
          {!user ? (
            <div className="gb-lock">
              Login dengan Google atau GitHub di atas untuk meninggalkan pesan & rating.
            </div>
          ) : (
            <div>
              {/* Rating Section: Single rating per user with Upsert and Edit */}
              {userRating && !isEditingRating ? (
                <div className="gb-my-rating">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#141414]">
                      Rating kamu:
                    </span>
                    <span className="bg-[#141414] text-[#ffd500] px-1.5 py-0.5 font-mono font-bold text-xs">
                      {userRating} ★
                    </span>
                    <span className="text-[11px] text-[#555]">
                      ({userRating} dari 5 bintang)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingRating(true)}
                    className="gb-edit-rating-btn"
                    aria-label="Ubah rating"
                  >
                    Ubah
                  </button>
                </div>
              ) : (
                <div className="gb-rr">
                  <span id="rating-label">
                    {isEditingRating ? 'Ubah rating kamu:' : 'Beri rating (opsional):'}
                  </span>
                  <div
                    className="gb-stars"
                    role="radiogroup"
                    aria-labelledby="rating-label"
                  >
                    {[1, 2, 3, 4, 5].map((val) => {
                      const active =
                        (hoverRating || (isEditingRating ? userRating : 0)) >= val;
                      return (
                        <button
                          key={val}
                          type="button"
                          disabled={ratingSubmitting}
                          className={`gb-star ${active ? 'on' : ''}`}
                          role="radio"
                          aria-label={`${val} bintang`}
                          aria-checked={userRating === val}
                          onClick={() => handleSaveRating(val)}
                          onMouseEnter={() => setHoverRating(val)}
                          onMouseLeave={() => setHoverRating(0)}
                        >
                          <svg viewBox="0 0 24 24">
                            <polygon
                              points="12,2 15,9 22,9.5 16.8,14.3 18.4,21.5 12,17.8 5.6,21.5 7.2,14.3 2,9.5 9,9"
                            />
                          </svg>
                        </button>
                      );
                    })}
                  </div>
                  {isEditingRating && (
                    <button
                      type="button"
                      onClick={() => setIsEditingRating(false)}
                      className="text-xs text-[#555] underline hover:text-[#141414] ml-auto font-mono cursor-pointer"
                    >
                      Batal
                    </button>
                  )}
                  {ratingSubmitting && (
                    <span className="text-xs font-mono text-[#555] animate-pulse">
                      Menyimpan...
                    </span>
                  )}
                  {ratingError && (
                    <span className="text-xs text-[#b3121a] font-bold w-full">
                      {ratingError}
                    </span>
                  )}
                </div>
              )}

              {/* Comment Input Form */}
              <form onSubmit={handleSubmit}>
                <div className="gb-fld">
                  <textarea
                    ref={textareaRef}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    maxLength={280}
                    aria-label="Tulis pesan untuk portofolio ini"
                    placeholder="Tulis pesan untuk portofolio ini..."
                    className="gb-textarea"
                  />
                  <button
                    type="submit"
                    disabled={submitting || cooldown > 0}
                    className="gb-send"
                  >
                    {submitting
                      ? '...'
                      : cooldown > 0
                      ? `(${cooldown}S)`
                      : 'KIRIM'}
                  </button>
                </div>

                {/* Status and Counter */}
                <div className="gb-inf">
                  <span className="gb-ct">{messageText.length}/280</span>
                  {errorMsg && (
                    <span className="gb-err" role="alert">
                      {errorMsg}
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}
        </footer>
      </div>
    </aside>
  );
}
