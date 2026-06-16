import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const login = useGameStore((state) => state.login);
  const register = useGameStore((state) => state.register);
  const navigate = useNavigate();

  const switchMode = (m: 'login' | 'register') => {
    setMode(m);
    setError('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
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
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-900 text-white">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
            TycoonX
          </h1>
          <p className="text-slate-500 text-sm mt-1">Become a Billionaire</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-800 rounded-2xl p-1 mb-6 border border-slate-700">
          <button
            onClick={() => switchMode('login')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              mode === 'login'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => switchMode('register')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              mode === 'register'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form card */}
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl">
          <h2 className="text-xl font-bold mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            {mode === 'login'
              ? 'Login to continue your empire'
              : 'Join TycoonX and start building wealth'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm text-center font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none text-white"
                placeholder="Enter username..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none text-white"
                placeholder="••••••••"
                required
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none text-white"
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/25 active:scale-[0.98] mt-2"
            >
              {mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Admin link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/admin-auth')}
            className="text-xs text-slate-700 hover:text-slate-500 transition-colors"
          >
            .
          </button>
        </div>
      </div>
    </div>
  );
};
