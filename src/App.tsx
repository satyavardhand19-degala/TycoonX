import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BottomNav } from './components/layout/BottomNav';
import { EarningsPage } from './pages/EarningsPage';
import { BusinessPage } from './pages/BusinessPage';
import { InvestingPage } from './pages/InvestingPage';
import { ItemsPage } from './pages/ItemsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPage } from './pages/AuthPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminPage } from './pages/AdminPage';
import { usePassiveIncome } from './hooks/usePassiveIncome';
import { useGameStore } from './store/gameStore';
import { formatCurrency } from './utils/format';
import { playCollect } from './utils/sounds';

const MAX_OFFLINE_SECONDS = 8 * 3600; // 8 hour cap
const MIN_OFFLINE_SECONDS = 30;       // ignore brief refreshes

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function OfflineModal({ earned, seconds, onCollect }: { earned: number; seconds: number; onCollect: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.88)' }}>
      <div className="w-full rounded-3xl p-6 text-center" style={{ background: 'var(--bg-card)', boxShadow: '0 0 40px rgba(255,107,0,0.25), 6px 6px 20px #0a0a0a' }}>
        <div className="text-5xl mb-4">💤</div>
        <p className="text-lg font-bold text-white mb-1">Welcome back!</p>
        <p className="text-sm mb-5" style={{ color: '#888' }}>
          You were away for <span style={{ color: '#FF6B00' }}>{formatDuration(seconds)}</span>
        </p>

        <div className="rounded-2xl py-4 px-5 mb-5" style={{ background: 'var(--bg-deep)', boxShadow: 'inset 3px 3px 8px #0d0d0d' }}>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#555' }}>Earned while away</p>
          <p className="text-3xl font-bold" style={{ color: '#FF6B00', textShadow: '0 0 20px rgba(255,107,0,0.5)' }}>
            {formatCurrency(earned)}
          </p>
          {seconds >= MAX_OFFLINE_SECONDS && (
            <p className="text-xs mt-1" style={{ color: '#666' }}>Capped at 8 hours max</p>
          )}
        </div>

        <button
          onClick={() => { playCollect(); onCollect(); }}
          className="w-full py-4 rounded-2xl font-bold text-white text-lg"
          style={{ background: 'linear-gradient(135deg,#FF8C00,#FF5500)', boxShadow: '0 4px 20px rgba(255,107,0,0.5)' }}
        >
          Collect 💰
        </button>
      </div>
    </div>
  );
}

function GameApp() {
  const user  = useGameStore(s => s.user);
  const theme = useGameStore(s => s.theme);
  usePassiveIncome();

  useEffect(() => {
    document.documentElement.dataset.theme = theme ?? 'dark';
  }, [theme]);

  const lastSeenAt          = useGameStore(s => s.lastSeenAt);
  const applyOfflineEarnings = useGameStore(s => s.applyOfflineEarnings);

  const [offlineEarned,  setOfflineEarned]  = useState(0);
  const [offlineSeconds, setOfflineSeconds] = useState(0);
  const [showModal,      setShowModal]      = useState(false);

  useEffect(() => {
    if (!user) return;
    const elapsed = Math.floor((Date.now() - (lastSeenAt ?? Date.now())) / 1000);
    if (elapsed < MIN_OFFLINE_SECONDS) return;
    const capped = Math.min(elapsed, MAX_OFFLINE_SECONDS);
    const earned = applyOfflineEarnings(capped);
    if (earned > 0) {
      setOfflineEarned(earned);
      setOfflineSeconds(capped);
      setShowModal(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) {
    return (
      <Routes>
        <Route path="/admin-auth" element={<AdminLoginPage />} />
        <Route path="*" element={<AuthPage />} />
      </Routes>
    );
  }

  return (
    <div className={`${user.role === 'user' ? 'pb-20' : ''} min-h-screen`} style={{ background: 'var(--bg-base)' }}>
      <Routes>
        {user.role === 'admin' ? (
          <>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/admin" />} />
          </>
        ) : (
          <>
            <Route path="/"          element={<EarningsPage />} />
            <Route path="/business"  element={<BusinessPage />} />
            <Route path="/investing" element={<InvestingPage />} />
            <Route path="/items"     element={<ItemsPage />} />
            <Route path="/profile"   element={<ProfilePage />} />
            <Route path="*"          element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
      {user.role === 'user' && <BottomNav />}
      {showModal && user.role === 'user' && (
        <OfflineModal
          earned={offlineEarned}
          seconds={offlineSeconds}
          onCollect={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <GameApp />
    </BrowserRouter>
  );
}
