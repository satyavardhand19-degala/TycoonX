import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { ShieldCheck } from 'lucide-react';

const NM_OUT = '6px 6px 14px #0d0d0d, -5px -5px 12px #2b2b2b';
const NM_IN  = 'inset 2px 2px 6px #0d0d0d, inset -2px -2px 6px #272727';

export const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [error, setError]       = useState('');
  const login          = useGameStore(s => s.login);
  const adminSecretKey = useGameStore(s => s.adminSecretKey);
  const navigate       = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) return;
    if (adminKey !== adminSecretKey) { setError('Invalid admin secret key.'); return; }
    login(username, 'admin');
    navigate('/admin');
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6 overflow-hidden" style={{ background: '#1a1a1a' }}>

      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full opacity-8 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #FF6B00 0%, transparent 70%)', filter: 'blur(50px)' }} />

      <div className="w-full max-w-sm relative z-10">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/logo.svg" alt="TycoonX" className="w-56 h-auto opacity-80" />
        </div>

        {/* Card */}
        <div className="rounded-3xl p-6" style={{ background: '#1e1e1e', boxShadow: NM_OUT }}>

          {/* Admin badge */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: '#161616', boxShadow: NM_IN }}>
              <ShieldCheck size={30} style={{ color: '#FF6B00' }} />
            </div>
            <h1 className="text-xl font-bold text-white">Admin Access</h1>
            <p className="text-xs mt-1 uppercase tracking-widest" style={{ color: '#666' }}>Secure control panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl px-4 py-3 text-sm font-medium text-center"
                style={{ background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.3)', color: '#ff6b6b' }}>
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#888' }}>
                Admin Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username..."
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                style={{ background: '#161616', boxShadow: NM_IN, border: 'none' }}
                onFocus={e => (e.target.style.boxShadow = `${NM_IN}, 0 0 0 2px #FF6B0066`)}
                onBlur={e => (e.target.style.boxShadow = NM_IN)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#888' }}>
                Secret Key
              </label>
              <input
                type="password"
                value={adminKey}
                onChange={e => setAdminKey(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                style={{ background: '#161616', boxShadow: NM_IN, border: 'none' }}
                onFocus={e => (e.target.style.boxShadow = `${NM_IN}, 0 0 0 2px #FF6B0066`)}
                onBlur={e => (e.target.style.boxShadow = NM_IN)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all active:scale-95 mt-2"
              style={{
                background: 'linear-gradient(135deg, #7B3F00, #FF6B00)',
                boxShadow: '0 4px 16px rgba(255,107,0,0.4)',
              }}
            >
              🛡️  Authorize Session
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-xs transition-colors"
              style={{ color: '#555' }}
              onMouseEnter={e => ((e.target as HTMLElement).style.color = '#888')}
              onMouseLeave={e => ((e.target as HTMLElement).style.color = '#555')}
            >
              ← Back to Player Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
