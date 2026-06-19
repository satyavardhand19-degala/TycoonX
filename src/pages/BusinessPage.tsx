import { useState } from 'react';
import { Building2, ChevronUp, X, GitMerge } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { formatCurrency } from '../utils/format';
import { BUSINESSES } from '../data/gameData';
import { playBuy, playUpgrade, playMerge } from '../utils/sounds';

function MergerModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  const ownedBusinesses = useGameStore(s => s.ownedBusinesses);
  const mergeBusiness   = useGameStore(s => s.mergeBusiness);
  const soundEnabled    = useGameStore(s => s.soundEnabled);

  const ownedList = BUSINESSES.filter(b => ownedBusinesses[b.id]);

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 2 ? [...prev, id] : prev
    );
  };

  const canMerge = selected.length === 2;

  const [idA, idB] = selected;
  const defA  = BUSINESSES.find(b => b.id === idA);
  const defB  = BUSINESSES.find(b => b.id === idB);
  const obA   = idA ? ownedBusinesses[idA] : null;
  const obB   = idB ? ownedBusinesses[idB] : null;

  const incomeA = defA && obA ? defA.baseIncomePerHour * obA.level * (obA.mergeBonus ?? 1) : 0;
  const incomeB = defB && obB ? defB.baseIncomePerHour * obB.level * (obB.mergeBonus ?? 1) : 0;
  const survivorId  = incomeA >= incomeB ? idA : idB;
  const absorbedId  = incomeA >= incomeB ? idB : idA;
  const survivorDef = BUSINESSES.find(b => b.id === survivorId);
  const survivorOb  = survivorId ? ownedBusinesses[survivorId] : null;
  const mergeCount  = survivorOb?.mergeCount ?? 0;
  const atMax       = mergeCount >= 3;
  const newIncome   = canMerge && survivorDef && survivorOb
    ? survivorDef.baseIncomePerHour * Math.max(obA?.level ?? 0, obB?.level ?? 0) * ((survivorOb.mergeBonus ?? 1) + 0.5)
    : 0;

  const handleMerge = () => {
    if (!canMerge || atMax) return;
    mergeBusiness(absorbedId, survivorId);
    if (soundEnabled) playMerge();
    onClose();
  };

  const NM = 'var(--nm-out)';

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="w-full max-h-[85vh] flex flex-col rounded-t-3xl" style={{ background: 'var(--bg-base)', boxShadow: '-2px -6px 30px #0a0a0a' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <h3 className="font-bold text-lg text-white">Business Mergers</h3>
            <p className="text-xs" style={{ color: '#666' }}>Select 2 businesses — the stronger absorbs the weaker</p>
          </div>
          <button className="nm-btn w-9 h-9 rounded-xl flex items-center justify-center" onClick={onClose}>
            <X size={18} color="#888" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-2 flex-1">
          {ownedList.length < 2 && (
            <p className="text-center py-8 text-sm" style={{ color: '#555' }}>Need at least 2 businesses to merge.</p>
          )}
          {ownedList.map(b => {
            const ob         = ownedBusinesses[b.id];
            const isSelected = selected.includes(b.id);
            const mc         = ob.mergeCount ?? 0;
            const income     = b.baseIncomePerHour * ob.level * (ob.mergeBonus ?? 1);
            const disabled   = !isSelected && selected.length === 2;

            return (
              <button
                key={b.id}
                onClick={() => !disabled && toggle(b.id)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all"
                style={{
                  background: isSelected ? '#2a1a00' : 'var(--bg-card)',
                  boxShadow: isSelected ? '0 0 14px rgba(255,107,0,0.4), inset 0 0 0 2px #FF6B00' : NM,
                  opacity: disabled ? 0.4 : 1,
                }}
              >
                <span className="text-2xl">{b.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-white text-sm">{b.name}</p>
                    {mc > 0 && (
                      <span className="text-xs">{'🔥'.repeat(mc)}</span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: '#888' }}>
                    Lv.{ob.level} · {formatCurrency(income)}/hr
                    {mc > 0 && <span style={{ color: '#FF6B00' }}> · {mc}/3 merges</span>}
                  </p>
                </div>
                {mc >= 3 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: '#2a2a2a', color: '#555' }}>MAX</span>
                )}
              </button>
            );
          })}
        </div>

        {canMerge && (
          <div className="px-4 pb-2 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            {atMax ? (
              <p className="text-center text-sm py-2" style={{ color: '#ff5555' }}>
                {survivorDef?.name} has reached max merges (3/3)
              </p>
            ) : (
              <div className="nm-card p-4 mb-3">
                <p className="text-xs mb-1" style={{ color: '#888' }}>Merge preview</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{BUSINESSES.find(b => b.id === survivorId)?.emoji}</span>
                  <p className="font-bold text-white text-sm">{survivorDef?.name} absorbs {BUSINESSES.find(b => b.id === absorbedId)?.name}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#888' }}>New income/hr</span>
                  <span className="font-bold" style={{ color: '#4CAF50' }}>+{formatCurrency(newIncome - incomeA)} → {formatCurrency(newIncome)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span style={{ color: '#888' }}>Merge bonus</span>
                  <span className="font-bold" style={{ color: '#FF6B00' }}>×{((survivorOb?.mergeBonus ?? 1) + 0.5).toFixed(1)}</span>
                </div>
              </div>
            )}
            <button
              onClick={handleMerge}
              disabled={atMax}
              className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#7B3F00,#FF6B00)', boxShadow: '0 4px 14px rgba(255,107,0,0.35)' }}
            >
              Confirm Merger
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function BusinessPage() {
  const [showShop,   setShowShop]   = useState(false);
  const [showMerger, setShowMerger] = useState(false);

  const ownedBusinesses          = useGameStore(s => s.ownedBusinesses);
  const balance                  = useGameStore(s => s.balance);
  const buyBusiness              = useGameStore(s => s.buyBusiness);
  const upgradeBusiness          = useGameStore(s => s.upgradeBusiness);
  const getBusinessIncomePerHour = useGameStore(s => s.getBusinessIncomePerHour);
  const soundEnabled             = useGameStore(s => s.soundEnabled);

  const totalIncome = getBusinessIncomePerHour();
  const ownedCount  = Object.keys(ownedBusinesses).length;

  return (
    <div className="min-h-screen pb-6" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Business</h1>
        <div className="flex items-center gap-1.5" style={{ color: '#555' }}>
          <Building2 size={15} />
          <span className="text-xs">Business slots</span>
        </div>
      </div>

      {/* Total income card */}
      <div className="mx-5 mb-5 nm-card p-5">
        <p
          className="text-2xl font-bold"
          style={{ color: '#FF6B00' }}
        >
          {formatCurrency(totalIncome)}
        </p>
        <p className="text-sm mt-1" style={{ color: '#888' }}>Total income per hour</p>
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, #FF6B00, transparent)' }} />
          <span className="text-xs" style={{ color: '#555' }}>
            {ownedCount} / {BUSINESSES.length} businesses
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mx-5 mb-6 flex gap-3">
        <button
          onClick={() => setShowShop(true)}
          className="nm-orange flex-1 font-bold py-4 rounded-2xl text-white"
        >
          Start a business
        </button>
        <button
          onClick={() => setShowMerger(true)}
          className="nm-btn flex-1 font-semibold py-4 rounded-2xl flex items-center justify-center gap-2"
          style={{ color: ownedCount >= 2 ? '#FF6B00' : '#555' }}
        >
          <GitMerge size={15} />
          Mergers
        </button>
      </div>

      {/* My companies */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white text-lg">My companies</h2>
          <span className="text-xs" style={{ color: '#555' }}>
            {ownedCount}/{BUSINESSES.length}
          </span>
        </div>

        {ownedCount === 0 && (
          <div className="nm-in rounded-2xl py-12 flex flex-col items-center gap-3">
            <span className="text-4xl">🏪</span>
            <p className="text-sm" style={{ color: '#666' }}>No businesses yet. Start one!</p>
          </div>
        )}

        <div className="space-y-3">
          {BUSINESSES.filter(b => ownedBusinesses[b.id]).map(b => {
            const ob           = ownedBusinesses[b.id];
            const incomePerHour = b.baseIncomePerHour * ob.level * (ob.mergeBonus ?? 1);
            const upgradeCost  = b.baseCost * ob.level * 0.5;
            const canUpgrade   = balance >= upgradeCost && ob.level < b.maxLevel;
            const progress     = ob.level / b.maxLevel;

            return (
              <div key={b.id} className="nm-card p-4 flex items-center gap-3">
                {/* Emoji icon */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: 'var(--bg-deep)', boxShadow: 'inset 3px 3px 7px #0d0d0d, inset -2px -2px 5px #252525' }}
                >
                  {b.emoji}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-white text-sm">{b.name}</p>
                    {(ob.mergeCount ?? 0) > 0 && (
                      <span className="text-xs">{'🔥'.repeat(ob.mergeCount ?? 0)}</span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: '#666' }}>{b.category}</p>
                  {/* Level bar */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1 rounded-full" style={{ background: '#2a2a2a' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${progress * 100}%`, background: 'linear-gradient(90deg, #FF6B00, #FF8C00)' }}
                      />
                    </div>
                    <span className="text-xs shrink-0" style={{ color: '#555' }}>
                      {ob.level}/{b.maxLevel}
                    </span>
                  </div>
                  <p className="text-sm font-bold mt-0.5" style={{ color: '#FF6B00' }}>
                    {formatCurrency(incomePerHour)}{' '}
                    <span className="font-normal text-xs" style={{ color: '#666' }}>/ hr</span>
                  </p>
                </div>

                {/* Upgrade btn */}
                <button
                  onClick={() => { upgradeBusiness(b.id); if (soundEnabled) playUpgrade(); }}
                  disabled={!canUpgrade}
                  className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={
                    canUpgrade
                      ? { background: 'linear-gradient(135deg, #FF8C00, #FF5500)', boxShadow: '3px 3px 8px rgba(255,107,0,0.4)' }
                      : { background: 'var(--bg-card)', boxShadow: 'inset 2px 2px 5px #0d0d0d, inset -1px -1px 3px #252525' }
                  }
                >
                  <ChevronUp size={16} color={canUpgrade ? '#fff' : '#444'} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {showMerger && <MergerModal onClose={() => setShowMerger(false)} />}

      {/* Shop sheet */}
      {showShop && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div
            className="w-full max-h-[82vh] flex flex-col rounded-t-3xl"
            style={{ background: 'var(--bg-base)', boxShadow: '-2px -6px 30px #0a0a0a' }}
          >
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 className="font-bold text-lg text-white">Start a Business</h3>
              <button
                onClick={() => setShowShop(false)}
                className="nm-btn w-9 h-9 rounded-xl flex items-center justify-center"
              >
                <X size={18} color="#888" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3">
              {BUSINESSES.filter(b => !ownedBusinesses[b.id]).map(b => (
                <button
                  key={b.id}
                  onClick={() => { buyBusiness(b.id); if (soundEnabled) playBuy(); }}
                  disabled={balance < b.baseCost}
                  className="nm-btn w-full flex items-center gap-3 p-4 rounded-2xl text-left disabled:opacity-40"
                >
                  <span className="text-3xl">{b.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm">{b.name}</p>
                    <p className="text-xs" style={{ color: '#888' }}>
                      {formatCurrency(b.baseIncomePerHour)}/hr • Max Lv.{b.maxLevel}
                    </p>
                  </div>
                  <span className="font-bold text-sm shrink-0" style={{ color: '#FF6B00' }}>
                    {formatCurrency(b.baseCost)}
                  </span>
                </button>
              ))}
              {BUSINESSES.every(b => ownedBusinesses[b.id]) && (
                <p className="text-center py-8" style={{ color: '#666' }}>You own all businesses!</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
