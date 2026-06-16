import { useState, useCallback } from 'react';
import { LogOut, Send, MessageSquare } from 'lucide-react';
import { playTax } from '../utils/sounds';
import { useGameStore } from '../store/gameStore';
import { formatCurrency } from '../utils/format';
import { PROPERTIES, BUSINESSES, CARS, PLANES, YACHTS, RESIDENCE_TIERS, COIN_COLLECTION, PAINTING_COLLECTION } from '../data/gameData';

const SLOT_ICONS = ['💼', '👜', '💰'];

interface SlotMeta { savedAt: number; fortune: number; }

function readSlotMeta(slot: number): SlotMeta | null {
  try {
    const raw = localStorage.getItem(`tycoonx-slot-${slot}`);
    if (!raw) return null;
    const { savedAt, fortune } = JSON.parse(raw);
    return { savedAt, fortune };
  } catch { return null; }
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24)    return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const NM_OUT = '6px 6px 14px #0d0d0d, -5px -5px 12px #2b2b2b';

export function ProfilePage() {
  const balance            = useGameStore(s => s.balance);
  const ownedBusinesses    = useGameStore(s => s.ownedBusinesses);
  const stockHoldings      = useGameStore(s => s.stockHoldings);
  const stockPrices        = useGameStore(s => s.stockPrices);
  const propertyHoldings   = useGameStore(s => s.propertyHoldings);
  const cryptoHoldings     = useGameStore(s => s.cryptoHoldings);
  const cryptoPrices       = useGameStore(s => s.cryptoPrices);
  const ownedCars          = useGameStore(s => s.ownedCars);
  const ownedPlanes        = useGameStore(s => s.ownedPlanes);
  const ownedYachts        = useGameStore(s => s.ownedYachts);
  const residenceLevel     = useGameStore(s => s.residenceLevel);
  const coinCollection     = useGameStore(s => s.coinCollection);
  const paintingCollection = useGameStore(s => s.paintingCollection);
  const taxDue             = useGameStore(s => s.taxDue);
  const totalTaxPaid       = useGameStore(s => s.totalTaxPaid);
  const payTaxes           = useGameStore(s => s.payTaxes);
  const getTaxRate         = useGameStore(s => s.getTaxRate);
  const getTaxPenalty      = useGameStore(s => s.getTaxPenalty);
  const getTotalIncomePerHour = useGameStore(s => s.getTotalIncomePerHour);
  const saveSlot           = useGameStore(s => s.saveSlot);
  const loadSlot           = useGameStore(s => s.loadSlot);
  const soundEnabled       = useGameStore(s => s.soundEnabled);
  const user               = useGameStore(s => s.user);
  const logout             = useGameStore(s => s.logout);
  const submitFeedback     = useGameStore(s => s.submitFeedback);

  const [slots, setSlots]       = useState<(SlotMeta | null)[]>(() => [1, 2, 3].map(readSlotMeta));
  const [confirmLoad, setConfirmLoad] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const refreshSlots = useCallback(() => setSlots([1, 2, 3].map(readSlotMeta)), []);

  const handleSave = (slot: number) => {
    saveSlot(slot);
    refreshSlots();
  };

  const handleLoad = (slot: number) => {
    loadSlot(slot);
    refreshSlots();
    setConfirmLoad(null);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim()) {
      submitFeedback(feedback);
      setFeedback('');
      setFeedbackSent(true);
      setTimeout(() => setFeedbackSent(false), 3000);
    }
  };

  const handleDelete = (slot: number) => {
    localStorage.removeItem(`tycoonx-slot-${slot}`);
    refreshSlots();
  };

  const businessesVal = BUSINESSES.reduce((t, b) => {
    const ob = ownedBusinesses[b.id];
    return ob ? t + b.baseCost * ob.level * 0.5 : t;
  }, 0);
  const stocksVal = Object.entries(stockHoldings).reduce((t, [id, h]) => t + h.shares * (stockPrices[id] ?? 0), 0);
  const realEstateVal = PROPERTIES.reduce((t, p) => propertyHoldings.includes(p.id) ? t + p.cost * 0.8 : t, 0);
  const cryptoVal = Object.entries(cryptoHoldings).reduce((t, [id, h]) => t + h.amount * (cryptoPrices[id] ?? 0), 0);
  const transportVal =
    CARS.filter(c => ownedCars.includes(c.id)).reduce((t, c) => t + c.cost, 0) +
    PLANES.filter(p => ownedPlanes.includes(p.id)).reduce((t, p) => t + p.cost, 0) +
    YACHTS.filter(y => ownedYachts.includes(y.id)).reduce((t, y) => t + y.cost, 0);
  const residenceVal   = RESIDENCE_TIERS[residenceLevel]?.netWorthValue ?? 0;
  const collectionsVal =
    COIN_COLLECTION.reduce((t, item, i) => t + (coinCollection[i] ? item.cost : 0), 0) +
    PAINTING_COLLECTION.reduce((t, item, i) => t + (paintingCollection[i] ? item.cost : 0), 0);

  const totalFortune = balance + businessesVal + stocksVal + realEstateVal +
    cryptoVal + transportVal + residenceVal + collectionsVal;

  const taxRate        = getTaxRate();
  const taxPenalty     = getTaxPenalty();
  const totalTaxDue    = taxDue * (1 + taxPenalty);
  const canPay         = balance >= totalTaxDue && taxDue > 0;
  const incomePerHour  = getTotalIncomePerHour();
  const taxablePerHour = incomePerHour * taxRate;
  const taxWarning     = taxDue > 0 && taxablePerHour > 0 && taxDue > taxablePerHour;
  const taxOverdue     = taxPenalty > 0;

  const categories = [
    { label: 'Balance',      value: balance,        color: '#00BCD4' },
    { label: 'Businesses',   value: businessesVal,  color: '#FF6B00' },
    { label: 'Stocks',       value: stocksVal,      color: '#FFD700' },
    { label: 'Real estate',  value: realEstateVal,  color: '#9C27B0' },
    { label: 'Transport',    value: transportVal,   color: '#4CAF50' },
    { label: 'Collections',  value: collectionsVal, color: '#E91E63' },
    { label: 'Cryptoassets', value: cryptoVal,      color: '#2196F3' },
    { label: 'Residence',    value: residenceVal,   color: '#FF5722' },
  ];

  const visible = categories.filter(c => c.value > 0);

  return (
    <div className="min-h-screen pb-6" style={{ background: '#1a1a1a' }}>
      <div className="px-4 pt-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-white">Profile</h1>
            {user && (
              <p className="text-xs text-slate-400">
                Logged in as <span className="text-emerald-400 font-bold">{user.username}</span> ({user.role})
              </p>
            )}
          </div>
          <button
            onClick={() => logout()}
            className="nm-btn flex items-center gap-2 rounded-xl px-4 py-2 text-red-400 font-bold text-sm"
            style={{ background: '#1e1e1e', boxShadow: NM_OUT }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* Fortune total */}
        <div className="mb-1">
          <p
            className="text-5xl font-bold leading-tight"
            style={{ color: '#fff', textShadow: '0 0 30px rgba(255,107,0,0.4)' }}
          >
            {formatCurrency(totalFortune)}
          </p>
          <p className="text-sm mt-1.5 font-semibold uppercase tracking-widest" style={{ color: '#FF6B00' }}>Fortune</p>
        </div>

        {/* Save slots */}
        <div className="flex flex-col gap-2 mt-5 mb-5">
          {slots.map((meta, i) => {
            const n = i + 1;
            return (
              <div
                key={n}
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: '#1e1e1e', boxShadow: NM_OUT }}
              >
                <span className="text-2xl shrink-0">{SLOT_ICONS[i]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">Slot {n}</p>
                  {meta ? (
                    <>
                      <p className="text-xs" style={{ color: '#FF6B00' }}>{formatCurrency(meta.fortune)}</p>
                      <p className="text-xs" style={{ color: '#555' }}>{timeAgo(meta.savedAt)}</p>
                    </>
                  ) : (
                    <p className="text-xs" style={{ color: '#444' }}>Empty</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleSave(n)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#7B3F00,#FF6B00)', boxShadow: '0 2px 8px rgba(255,107,0,0.3)' }}
                  >
                    Save
                  </button>
                  {meta && (
                    <>
                      <button
                        onClick={() => setConfirmLoad(n)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold"
                        style={{ background: '#1a1a1a', boxShadow: NM_OUT, color: '#4CAF50' }}
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDelete(n)}
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold"
                        style={{ background: '#1a1a1a', boxShadow: NM_OUT, color: '#555' }}
                      >
                        ✕
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Load confirmation modal */}
        {confirmLoad !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.85)' }}>
            <div className="w-full rounded-3xl p-6" style={{ background: '#1e1e1e', boxShadow: NM_OUT }}>
              <p className="font-bold text-white text-lg mb-1">Load Slot {confirmLoad}?</p>
              <p className="text-sm mb-5" style={{ color: '#888' }}>This will replace your current progress with the saved data.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmLoad(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm"
                  style={{ background: '#1a1a1a', boxShadow: NM_OUT, color: '#888' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleLoad(confirmLoad)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-white"
                  style={{ background: 'linear-gradient(135deg,#7B3F00,#FF6B00)', boxShadow: '0 4px 14px rgba(255,107,0,0.35)' }}
                >
                  Load
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fortune bar */}
        {visible.length > 0 && (
          <div className="rounded-full overflow-hidden h-3 mb-6 flex gap-0.5" style={{ background: '#161616', boxShadow: 'inset 3px 3px 6px #0d0d0d' }}>
            {visible.map(c => (
              <div
                key={c.label}
                style={{
                  flex: c.value / totalFortune,
                  background: c.color,
                  boxShadow: `0 0 6px ${c.color}88`,
                }}
              />
            ))}
          </div>
        )}

        {/* Category grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {categories.map(cat => (
            <div key={cat.label} className="nm-card p-4 flex items-center gap-3">
              <div
                className="w-2 h-10 rounded-full shrink-0"
                style={{ background: cat.color, boxShadow: `0 0 8px ${cat.color}88` }}
              />
              <div className="min-w-0">
                <p className="text-xs" style={{ color: '#888' }}>{cat.label}</p>
                <p className="font-bold text-white text-sm truncate">{formatCurrency(cat.value)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Taxes card */}
        <div
          className="rounded-2xl p-5 mb-4"
          style={{
            background: '#1e1e1e',
            boxShadow: taxOverdue
              ? '0 0 20px rgba(255,60,60,0.45), 4px 4px 14px #0d0d0d'
              : taxWarning
              ? '0 0 16px rgba(255,107,0,0.4), 4px 4px 14px #0d0d0d'
              : NM_OUT,
          }}
        >
          {/* Header row */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🏛️</span>
            <div className="flex-1">
              <p className="font-bold text-white text-lg leading-none">Taxes</p>
              <p className="text-xs mt-0.5" style={{ color: '#666' }}>
                {taxRate > 0 ? `${(taxRate * 100).toFixed(0)}% rate on income` : 'Exempt — grow your fortune'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: '#888' }}>Total paid</p>
              <p className="text-sm font-bold text-white">{formatCurrency(totalTaxPaid)}</p>
            </div>
          </div>

          {/* Tax due amount */}
          <div
            className="rounded-xl p-3 mb-3 flex items-center justify-between"
            style={{ background: '#161616', boxShadow: 'inset 2px 2px 5px #0d0d0d' }}
          >
            <div>
              <p className="text-xs mb-0.5" style={{ color: '#888' }}>Tax due</p>
              <p
                className="font-bold text-xl"
                style={{ color: taxOverdue ? '#ff4444' : taxWarning ? '#FF6B00' : '#fff' }}
              >
                {formatCurrency(taxDue)}
              </p>
              {taxPenalty > 0 && (
                <p className="text-xs mt-0.5" style={{ color: '#ff6666' }}>
                  +25% overdue penalty → {formatCurrency(totalTaxDue)}
                </p>
              )}
            </div>
            {taxOverdue && (
              <span
                className="text-xs font-bold px-2 py-1 rounded-lg"
                style={{ background: '#ff4444', color: '#fff' }}
              >
                OVERDUE
              </span>
            )}
            {taxWarning && !taxOverdue && (
              <span
                className="text-xs font-bold px-2 py-1 rounded-lg"
                style={{ background: '#FF6B00', color: '#fff' }}
              >
                DUE SOON
              </span>
            )}
            {taxDue <= 0 && (
              <span
                className="text-xs font-bold px-2 py-1 rounded-lg"
                style={{ background: '#2E7D32', color: '#fff' }}
              >
                CLEAR ✓
              </span>
            )}
          </div>

          {/* Tax bracket info */}
          <div className="flex justify-between mb-3 px-1">
            {[
              { label: '< ₹1Cr', rate: '0%', active: totalFortune < 1e7 },
              { label: '₹1–100Cr', rate: '10%', active: totalFortune >= 1e7 && totalFortune < 1e9 },
              { label: '₹100Cr–10kCr', rate: '20%', active: totalFortune >= 1e9 && totalFortune < 1e11 },
              { label: '> ₹10kCr', rate: '30%', active: totalFortune >= 1e11 },
            ].map(bracket => (
              <div key={bracket.label} className="text-center">
                <p
                  className="text-xs font-bold"
                  style={{ color: bracket.active ? '#FF6B00' : '#444' }}
                >
                  {bracket.rate}
                </p>
                <p className="text-xs" style={{ color: bracket.active ? '#888' : '#333', fontSize: 9 }}>
                  {bracket.label}
                </p>
              </div>
            ))}
          </div>

          {/* Pay button */}
          <button
            onClick={() => { payTaxes(); if (soundEnabled && canPay) playTax(); }}
            disabled={!canPay}
            className="w-full py-3 rounded-xl font-bold text-white transition-all active:scale-95"
            style={{
              background: canPay
                ? 'linear-gradient(135deg, #7B3F00, #FF6B00)'
                : '#2a2a2a',
              color: canPay ? '#fff' : '#555',
              boxShadow: canPay ? '0 4px 14px rgba(255,107,0,0.35)' : 'none',
              cursor: canPay ? 'pointer' : 'not-allowed',
            }}
          >
            {taxDue <= 0
              ? 'No taxes due ✓'
              : !canPay
              ? `Insufficient funds (need ${formatCurrency(totalTaxDue)})`
              : `Pay ${formatCurrency(totalTaxDue)}`}
          </button>
        </div>

        {/* Feedback Section */}
        <div
          className="rounded-2xl p-6 mb-4 mt-8"
          style={{ background: '#1e1e1e', boxShadow: NM_OUT }}
        >
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Feedback</h2>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Have suggestions or found a bug? Let us know!
          </p>

          {feedbackSent ? (
            <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-xl p-4 text-emerald-400 text-sm font-medium animate-pulse text-center">
              Thank you for your feedback!
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-3">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Type your feedback here..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px] transition-all"
                required
              />
              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                <Send size={16} />
                Send Feedback
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
