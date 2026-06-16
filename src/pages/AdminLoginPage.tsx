import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

export const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');
  const login = useGameStore((state) => state.login);
  const adminSecretKey = useGameStore((state) => state.adminSecretKey);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username.trim()) {
      if (adminKey !== adminSecretKey) {
        setError('Invalid Admin Secret Key');
        return;
      }
      login(username, 'admin');
      navigate('/admin');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-900 text-white">
      <div className="w-full max-w-md p-8 bg-slate-800 rounded-2xl shadow-xl border border-cyan-500/30">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-cyan-500/10 rounded-full border border-cyan-500/50">
            <h2 className="text-2xl font-black text-cyan-400">ADMIN</h2>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2 text-center text-white">
          Control Panel
        </h1>
        <p className="text-slate-400 mb-8 text-center text-sm uppercase tracking-widest">
          Secure Access Only
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Admin Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none"
              placeholder="Enter username..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Secret Key
            </label>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
          >
            Authorize Session
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate('/')}
            className="text-xs text-slate-500 hover:text-slate-400 transition-colors"
          >
            Back to Player Login
          </button>
        </div>
      </div>
    </div>
  );
};
