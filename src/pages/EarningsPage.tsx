import { useState, useRef, useEffect } from 'react';
import { Zap, Volume2, VolumeX } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { formatCurrency, formatCurrencyFull } from '../utils/format';
import { CLICK_UPGRADES } from '../data/gameData';
import { playCoin, playBuy } from '../utils/sounds';

const NM_OUT    = '6px 6px 14px #0d0d0d, -5px -5px 12px #2b2b2b';
const TAP_IDLE  = 'inset 12px 12px 26px #0c0c0c, inset -10px -10px 20px #282828';
const TAP_HIT   = '8px 8px 18px #0d0d0d, -6px -6px 16px #272727, 0 0 40px rgba(255,107,0,0.35)';
const TAP_AUTO  = '8px 8px 18px #0d0d0d, -6px -6px 16px #272727, 0 0 55px rgba(255,107,0,0.55)';

export function EarningsPage() {
  const [tapped,     setTapped]     = useState(false);
  const [autoClick,  setAutoClick]  = useState(false);
  const [particles,  setParticles]  = useState<{ id: number; x: number; y: number; dx: number }[]>([]);

  const autoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const longPressRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const particleId      = useRef(0);

  const click             = useGameStore(s => s.click);
  const balance           = useGameStore(s => s.balance);
  const purchasedUpgrades = useGameStore(s => s.purchasedUpgrades);
  const buyClickUpgrade   = useGameStore(s => s.buyClickUpgrade);
  const getPerClick       = useGameStore(s => s.getPerClick);
  const soundEnabled      = useGameStore(s => s.soundEnabled);
  const toggleSound       = useGameStore(s => s.toggleSound);

  const perClick          = getPerClick();
  const availableUpgrades = CLICK_UPGRADES.filter(u => !purchasedUpgrades.includes(u.id));

  const toggleAutoClick = () => {
    if (autoIntervalRef.current) {
      clearInterval(autoIntervalRef.current);
      autoIntervalRef.current = null;
      setAutoClick(false);
    } else {
      setAutoClick(true);
      autoIntervalRef.current = setInterval(() => {
        useGameStore.getState().click();
      }, 1);
    }
  };

  const onLongPressStart = () => {
    longPressRef.current = setTimeout(toggleAutoClick, 800);
  };

  const onLongPressEnd = () => {
    if (longPressRef.current) clearTimeout(longPressRef.current);
  };

  useEffect(() => {
    return () => {
      if (autoIntervalRef.current) clearInterval(autoIntervalRef.current);
      if (longPressRef.current)    clearTimeout(longPressRef.current);
    };
  }, []);

  const handleTap = () => {
    click();
    if (soundEnabled) playCoin();
    setTapped(true);
    setTimeout(() => setTapped(false), 140);

    const count = 4 + Math.floor(Math.random() * 3);
    const spawned = Array.from({ length: count }, () => ({
      id:  ++particleId.current,
      x:   60 + Math.random() * 90,
      y:   70 + Math.random() * 70,
      dx:  (Math.random() - 0.5) * 70,
    }));
    setParticles(prev => [...prev, ...spawned]);
    setTimeout(() => {
      const ids = new Set(spawned.map(p => p.id));
      setParticles(prev => prev.filter(p => !ids.has(p.id)));
    }, 900);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]" style={{ background: '#1a1a1a' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <h1
            className="text-2xl font-bold text-white select-none"
            onMouseDown={onLongPressStart}
            onMouseUp={onLongPressEnd}
            onMouseLeave={onLongPressEnd}
            onTouchStart={onLongPressStart}
            onTouchEnd={onLongPressEnd}
          >
            Earnings
          </h1>
          <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="nm-btn w-9 h-9 rounded-xl flex items-center justify-center"
          >
            {soundEnabled
              ? <Volume2 size={15} color="#FF6B00" />
              : <VolumeX size={15} color="#444" />}
          </button>
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{
              background: '#1e1e1e',
              boxShadow: autoClick
                ? '0 0 12px rgba(255,107,0,0.7), 3px 3px 8px #0d0d0d'
                : NM_OUT,
              transition: 'box-shadow 0.3s ease',
            }}
          >
            <Zap
              size={13}
              color="#FF6B00"
              fill={autoClick ? '#FF6B00' : 'none'}
              style={{ filter: autoClick ? 'drop-shadow(0 0 4px #FF6B00)' : 'none' }}
            />
            <span className="text-xs font-semibold" style={{ color: '#FF6B00' }}>
              {autoClick ? 'AUTO' : '91%'}
            </span>
          </div>
          </div>
        </div>
      </div>

      {/* Credit card */}
      <div className="mx-5 mb-4">
        <div className="nm-card p-5">
          {/* Card top row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full" style={{ background: '#FF6B00', opacity: 0.95 }} />
              <div className="w-8 h-8 rounded-full" style={{ background: '#FF3300', opacity: 0.7 }} />
            </div>
            <span className="font-mono text-sm" style={{ color: '#666', letterSpacing: 2 }}>**** 7439</span>
            <span className="font-mono text-sm" style={{ color: '#666' }}>05/26</span>
          </div>

          {/* Balance */}
          <p className="text-xs mb-1" style={{ color: '#666' }}>Balance:</p>
          <p className="font-bold font-mono text-xl leading-tight text-white break-all">
            {formatCurrencyFull(balance)}
          </p>

          {/* Orange strip */}
          <div
            className="h-0.5 mt-5 rounded-full"
            style={{ background: 'linear-gradient(90deg, #FF6B00, #FF8C00 60%, transparent)' }}
          />
        </div>
      </div>

      {/* Per click pill */}
      <div className="mx-5 mb-6">
        <div
          className="rounded-xl px-5 py-3 inline-flex items-center gap-2"
          style={{ background: '#161616', boxShadow: 'inset 4px 4px 8px #0d0d0d, inset -3px -3px 6px #252525' }}
        >
          <span className="font-bold text-white">{formatCurrency(perClick)}</span>
          <span className="text-sm" style={{ color: '#888' }}>per click</span>
        </div>
      </div>

      {/* Tap zone */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5">
        <div
          onClick={handleTap}
          className="rounded-full flex flex-col items-center justify-center select-none"
          style={{
            width: 210,
            height: 210,
            background: '#1a1a1a',
            boxShadow: autoClick ? TAP_AUTO : tapped ? TAP_HIT : TAP_IDLE,
            transition: 'box-shadow 0.13s ease',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'visible',
          }}
        >
          <span
            style={{
              fontSize: 64,
              lineHeight: 1,
              transform: tapped ? 'scale(0.88)' : 'scale(1)',
              transition: 'transform 0.1s ease',
            }}
          >
            💰
          </span>
          <p
            className="text-xs mt-3 font-semibold tracking-widest uppercase"
            style={{ color: tapped ? '#FF6B00' : '#555' }}
          >
            tap to earn
          </p>

          {particles.map(p => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: p.x,
                top: p.y,
                ['--coin-dx' as string]: `${p.dx}px`,
                animation: 'coin-float 0.85s ease-out forwards',
                pointerEvents: 'none',
                fontSize: 13,
                fontWeight: 800,
                color: '#FF6B00',
                whiteSpace: 'nowrap',
                textShadow: '0 0 8px rgba(255,107,0,0.9)',
                zIndex: 20,
              } as React.CSSProperties}
            >
              +{formatCurrency(perClick)}
            </div>
          ))}
        </div>
      </div>

      {/* Click upgrades */}
      {availableUpgrades.length > 0 && (
        <div className="px-5 pb-4">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#555' }}>
            Click Upgrades
          </p>
          <div className="space-y-2">
            {availableUpgrades.slice(0, 3).map(u => (
              <button
                key={u.id}
                onClick={() => { buyClickUpgrade(u.id); if (soundEnabled) playBuy(); }}
                disabled={balance < u.cost}
                className="nm-btn w-full flex items-center justify-between rounded-2xl px-4 py-3 disabled:opacity-40"
              >
                <div className="text-left">
                  <p className="font-semibold text-sm text-white">{u.name}</p>
                  <p className="text-xs" style={{ color: '#888' }}>{u.description}</p>
                </div>
                <span className="text-sm font-bold ml-3 shrink-0" style={{ color: '#FF6B00' }}>
                  {formatCurrency(u.cost)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
