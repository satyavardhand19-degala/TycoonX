import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { MessageSquare, User, Clock, ShieldCheck, Users, LogOut, Edit2, Trash2, Check, X, KeyRound } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { UserRole } from '../types/game.types';

export const AdminPage: React.FC = () => {
  const feedbackList = useGameStore((state) => state.feedbackList);
  const registeredUsers = useGameStore((state) => state.registeredUsers);
  const user = useGameStore((state) => state.user);
  const logout = useGameStore((state) => state.logout);

  const updateUser = useGameStore((state) => state.updateUser);
  const deleteUser = useGameStore((state) => state.deleteUser);
  const updateFeedback = useGameStore((state) => state.updateFeedback);
  const deleteFeedback = useGameStore((state) => state.deleteFeedback);
  const updateAdminCredentials = useGameStore((state) => state.updateAdminCredentials);
  const adminSecretKey = useGameStore((state) => state.adminSecretKey);

  // Edit State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('user');

  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);
  const [editFeedbackMsg, setEditFeedbackMsg] = useState('');

  const [newAdminUsername, setNewAdminUsername] = useState(user?.username ?? '');
  const [newAdminKey, setNewAdminKey] = useState(adminSecretKey);
  const [credMsg, setCredMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveCredentials = () => {
    const err = updateAdminCredentials(newAdminUsername, newAdminKey);
    if (err) {
      setCredMsg({ type: 'error', text: err });
    } else {
      setCredMsg({ type: 'success', text: 'Credentials updated successfully.' });
    }
    setTimeout(() => setCredMsg(null), 3000);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-6 bg-slate-900 text-white">
        <h1 className="text-2xl font-bold text-red-400">Access Denied</h1>
        <p className="text-slate-400 mt-2">You must be an admin to view this page.</p>
      </div>
    );
  }

  const handleStartEditUser = (u: any) => {
    setEditingUserId(u.id);
    setEditUsername(u.username);
    setEditPassword(u.password || '');
    setEditRole(u.role);
  };

  const handleSaveUser = () => {
    if (editingUserId && editUsername.trim()) {
      updateUser(editingUserId, editUsername, editRole, editPassword);
      setEditingUserId(null);
    }
  };

  const handleStartEditFeedback = (f: any) => {
    setEditingFeedbackId(f.id);
    setEditFeedbackMsg(f.message);
  };

  const handleSaveFeedback = () => {
    if (editingFeedbackId && editFeedbackMsg.trim()) {
      updateFeedback(editingFeedbackId, editFeedbackMsg);
      setEditingFeedbackId(null);
    }
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white pb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/20 rounded-xl">
            <ShieldCheck className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-slate-400">Manage users and review feedback</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-xl border border-slate-700 transition-all active:scale-95 font-bold text-sm"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="text-slate-400 text-sm mb-1">Total Users</div>
          <div className="text-3xl font-bold text-white">{registeredUsers.filter(u => u.role !== 'admin').length}</div>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="text-slate-400 text-sm mb-1">Total Feedback</div>
          <div className="text-3xl font-bold text-white">{feedbackList.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User List Section */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold">Registered Users</h2>
          </div>
          
          <div className="divide-y divide-slate-700">
            {registeredUsers.filter(u => u.role !== 'admin').length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No users registered yet.
              </div>
            ) : (
              registeredUsers.filter(u => u.role !== 'admin').map((regUser) => (
                <div key={regUser.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                  {editingUserId === regUser.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value)}
                          placeholder="Username"
                          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value as UserRole)}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                        >
                          <option value="user">USER</option>
                          <option value="admin">ADMIN</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingUserId(null)} className="p-1.5 text-slate-400 hover:text-white transition-colors">
                          <X size={18} />
                        </button>
                        <button onClick={handleSaveUser} className="p-1.5 text-cyan-400 hover:text-cyan-300 transition-colors">
                          <Check size={18} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-900 rounded-lg">
                          <User className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{regUser.username}</p>
                          <p className="text-xs text-slate-500">ID: {regUser.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          regUser.role === 'admin' 
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/50' 
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/50'
                        }`}>
                          {regUser.role.toUpperCase()}
                        </span>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleStartEditUser(regUser)}
                            className="p-1.5 text-slate-500 hover:text-cyan-400 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => deleteUser(regUser.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Feedback Section */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold">Recent Feedback</h2>
          </div>
          
          <div className="divide-y divide-slate-700 max-h-[600px] overflow-y-auto">
            {feedbackList.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No feedback submitted yet.
              </div>
            ) : (
              [...feedbackList].reverse().map((feedback) => (
                <div key={feedback.id} className="p-6 hover:bg-slate-700/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-900 rounded-lg">
                        <User className="w-4 h-4 text-slate-400" />
                      </div>
                      <span className="font-semibold text-emerald-400">{feedback.username}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDistanceToNow(feedback.timestamp, { addSuffix: true })}
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleStartEditFeedback(feedback)}
                          className="p-1 text-slate-500 hover:text-emerald-400 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => deleteFeedback(feedback.id)}
                          className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {editingFeedbackId === feedback.id ? (
                    <div className="mt-3 pl-10 space-y-3">
                      <textarea
                        value={editFeedbackMsg}
                        onChange={(e) => setEditFeedbackMsg(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 text-sm focus:ring-1 focus:ring-emerald-500 outline-none min-h-[80px]"
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingFeedbackId(null)} className="p-1.5 text-slate-400 hover:text-white transition-colors">
                          <X size={18} />
                        </button>
                        <button onClick={handleSaveFeedback} className="p-1.5 text-emerald-400 hover:text-emerald-300 transition-colors">
                          <Check size={18} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-300 leading-relaxed pl-10">
                      {feedback.message}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Change Credentials */}
      <div className="mt-8 bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-orange-400" />
          <h2 className="text-xl font-bold">Change Admin Credentials</h2>
        </div>
        <div className="p-6 space-y-4 max-w-md">
          {credMsg && (
            <div className={`p-3 rounded-xl text-sm font-medium text-center border ${
              credMsg.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                : 'bg-red-500/10 border-red-500/40 text-red-400'
            }`}>
              {credMsg.text}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Admin Username
            </label>
            <input
              type="text"
              value={newAdminUsername}
              onChange={(e) => setNewAdminUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-white text-sm"
              placeholder="New username..."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Secret Key (min 6 chars)
            </label>
            <input
              type="text"
              value={newAdminKey}
              onChange={(e) => setNewAdminKey(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-white text-sm font-mono"
              placeholder="New secret key..."
            />
          </div>
          <button
            onClick={handleSaveCredentials}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors text-sm active:scale-95"
          >
            Save Credentials
          </button>
        </div>
      </div>
    </div>
  );
};
