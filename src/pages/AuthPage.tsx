import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

const NM_OUT = 'var(--nm-out)';
const NM_IN  = 'var(--nm-in-sm)';

export const AuthPage: React.FC = () => {
  const [mode, setMode]                   = useState<'login' | 'register'>('login');
  const [username, setUsername]           = useState('');
  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]                 = useState('');

  const login    = useGameStore(s => s.login);
  const register = useGameStore(s => s.register);
  const navigate = useNavigate();

  const switchMode = (m: 'login' | 'register') => {
    setMode(m); setError('');
    setUsername(''); setPassword(''); setConfirmPassword('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) return;
    if (mode === 'register') {
      if (password.length < 4) { setError('Password must be at least 4 characters.'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
      const err = register(username.trim(), password);
      if (err) setError(err);
    } else {
      const err = login(username.trim(), 'user', password);
      if (err) setError(err);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6 py-10 overflow-hidden" style={{ background: 'var(--bg-base)' }}>

      {/* Decorative background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #FF6B00 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute bottom-10 right-0 w-60 h-60 rounded-full opacity-5 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #FF6B00 0%, transparent 70%)', filter: 'blur(50px)' }} />

      {/* Floating coin emojis */}
      <span className="absolute top-10 left-5 text-3xl opacity-20 rotate-12 select-none pointer-events-none">🪙</span>
      <span className="absolute top-20 right-8 text-xl opacity-15 -rotate-6 select-none pointer-events-none">💰</span>
      <span className="absolute bottom-28 left-8 text-2xl opacity-10 rotate-6 select-none pointer-events-none">💎</span>
      <span className="absolute bottom-16 right-6 text-2xl opacity-15 -rotate-12 select-none pointer-events-none">🏆</span>

      <div className="w-full max-w-sm relative z-10">

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <img src="/logo.svg" alt="TycoonX" className="w-64 h-auto" />
        </div>

        {/* Card */}
        <div className="rounded-3xl p-6" style={{ background: 'var(--bg-card)', boxShadow: NM_OUT }}>

          {/* Tab switcher */}
          <div className="flex rounded-2xl p-1 mb-6" style={{ background: 'var(--bg-deep)', boxShadow: NM_IN }}>
            {(['login', 'register'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => switchMode(tab)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                style={mode === tab ? {
                  background: 'linear-gradient(135deg, #7B3F00, #FF6B00)',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(255,107,0,0.4)',
                } : { color: '#666' }}
              >
                {tab === 'login' ? 'Login' : 'Register'}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="mb-5">
            <h2 className="text-xl font-bold text-white">
              {mode === 'login' ? 'Welcome back 👋' : 'Join TycoonX 🚀'}
            </h2>
            <p className="text-xs mt-1" style={{ color: '#666' }}>
              {mode === 'login' ? 'Login to continue your empire' : 'Create your billionaire account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl px-4 py-3 text-sm font-medium text-center"
                style={{ background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.3)', color: '#ff6b6b' }}>
                {error}
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#888' }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username..."
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                style={{ background: 'var(--bg-deep)', boxShadow: NM_IN, border: 'none' }}
                onFocus={e => (e.target.style.boxShadow = `${NM_IN}, 0 0 0 2px #FF6B0066`)}
                onBlur={e => (e.target.style.boxShadow = NM_IN)}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#888' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                style={{ background: 'var(--bg-deep)', boxShadow: NM_IN, border: 'none' }}
                onFocus={e => (e.target.style.boxShadow = `${NM_IN}, 0 0 0 2px #FF6B0066`)}
                onBlur={e => (e.target.style.boxShadow = NM_IN)}
                required
              />
            </div>

            {/* Confirm Password */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#888' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                  style={{ background: 'var(--bg-deep)', boxShadow: NM_IN, border: 'none' }}
                  onFocus={e => (e.target.style.boxShadow = `${NM_IN}, 0 0 0 2px #FF6B0066`)}
                  onBlur={e => (e.target.style.boxShadow = NM_IN)}
                  required
                />
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all active:scale-95 mt-2"
              style={{
                background: 'linear-gradient(135deg, #7B3F00, #FF6B00)',
                boxShadow: '0 4px 16px rgba(255,107,0,0.4)',
              }}
            >
              {mode === 'login' ? '🎮  Enter Game' : '🚀  Create Account'}
            </button>
          </form>
        </div>

        {/* Hidden admin link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/admin-auth')}
            className="text-xs transition-colors"
            style={{ color: '#2a2a2a' }}
            onMouseEnter={e => ((e.target as HTMLElement).style.color = '#444')}
            onMouseLeave={e => ((e.target as HTMLElement).style.color = '#2a2a2a')}
          >
            ·
          </button>
        </div>
      </div>
    </div>
  );
};
