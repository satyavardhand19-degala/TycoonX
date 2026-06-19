import { useState } from 'react';
import { TrendingUp, TrendingDown, ChevronRight, X } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { formatCurrency } from '../utils/format';
import { STOCKS, PROPERTIES, CRYPTOS } from '../data/gameData';

const STOCK_TOTAL_SHARES = 1000;
import { playBuy, playSell } from '../utils/sounds';

type InvestTab = 'shares' | 'realestate' | 'crypto';

const NM_OUT = '6px 6px 14px #0d0d0d, -5px -5px 12px #2b2b2b';
const NM_IN  = 'inset 5px 5px 11px #0d0d0d, inset -4px -4px 9px #272727';

function SharesTab() {
  const [showMarket,  setShowMarket]  = useState(false);
  const [selectedId,  setSelectedId]  = useState<string | null>(null);

  const stockHoldings          = useGameStore(s => s.stockHoldings);
  const stockPrices            = useGameStore(s => s.stockPrices);
  const balance                = useGameStore(s => s.balance);
  const buyStock               = useGameStore(s => s.buyStock);
  const getStockPortfolioValue = useGameStore(s => s.getStockPortfolioValue);
  const getStockIncomePerHour  = useGameStore(s => s.getStockIncomePerHour);

  const portfolioValue = getStockPortfolioValue();
  const yieldPerHour   = getStockIncomePerHour();
  const costBasis = STOCKS.reduce((t, s) => {
    const h = stockHoldings[s.id];
    return h ? t + h.shares * h.avgBuyPrice : t;
  }, 0);
  const gain    = portfolioValue - costBasis;
  const gainPct = costBasis > 0 ? (gain / costBasis) * 100 : 0;

  const investedCount   = STOCKS.filter(s => (stockHoldings[s.id]?.shares ?? 0) > 0).length;
  const ownedCount      = STOCKS.filter(s => (stockHoldings[s.id]?.shares ?? 0) >= STOCK_TOTAL_SHARES).length;
  const totalStockCount = STOCKS.length;

  return (
    <div className="p-4 space-y-4">
      {/* Portfolio card */}
      <div className="nm-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">💼</span>
            <span className="font-semibold text-white text-sm">My stock portfolio</span>
          </div>
          <ChevronRight size={16} color="#555" />
        </div>
        <p className="text-xs" style={{ color: '#888' }}>Portfolio value</p>
        <p className="text-2xl font-bold text-white mt-0.5">Rs. {Math.round(portfolioValue).toLocaleString('en-IN')}</p>
        {gain !== 0 && (
          <p className={`text-sm font-semibold mt-1 flex items-center gap-1 ${gain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {gain >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {gain >= 0 ? '+' : '-'}Rs. {Math.abs(Math.round(gain)).toLocaleString('en-IN')} ({gainPct.toFixed(2)}%) all time
          </p>
        )}
        <div className="h-px mt-3 mb-3" style={{ background: '#2a2a2a' }} />
        <p className="text-xs" style={{ color: '#888' }}>Estimated yield / hour</p>
        <p className="text-lg font-bold mt-0.5" style={{ color: '#FF6B00' }}>Rs. {Math.round(yieldPerHour).toLocaleString('en-IN')}</p>
        <div className="h-px mt-3 mb-3" style={{ background: '#2a2a2a' }} />

        {/* Companies invested */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs" style={{ color: '#888' }}>Companies invested</p>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-white">{investedCount}</span>
            <span className="text-xs" style={{ color: '#555' }}>/</span>
            <span className="text-sm font-bold" style={{ color: '#FF6B00' }}>{totalStockCount}</span>
          </div>
        </div>
        <div className="rounded-full overflow-hidden mb-3" style={{ height: 4, background: '#2a2a2a' }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${(investedCount / totalStockCount) * 100}%`, background: 'linear-gradient(90deg,#FF8C00,#FF5500)' }} />
        </div>

        {/* Companies owned (all 1000 shares bought) */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs" style={{ color: '#888' }}>Companies owned <span style={{ color: '#444' }}>({STOCK_TOTAL_SHARES} shares each)</span></p>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-white">{ownedCount}</span>
            <span className="text-xs" style={{ color: '#555' }}>/</span>
            <span className="text-sm font-bold" style={{ color: '#FF6B00' }}>{totalStockCount}</span>
          </div>
        </div>
        <div className="rounded-full overflow-hidden" style={{ height: 4, background: '#2a2a2a' }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${(ownedCount / totalStockCount) * 100}%`, background: 'linear-gradient(90deg,#4CAF50,#2E7D32)' }} />
        </div>
      </div>

      {/* Stock market button */}
      <button
        onClick={() => setShowMarket(true)}
        className="nm-orange w-full rounded-2xl p-4 flex items-center justify-between text-white"
      >
        <div className="text-left">
          <p className="font-bold">Stock market</p>
          <p className="text-sm opacity-70">View all available offers</p>
        </div>
        <ChevronRight size={20} />
      </button>

      {/* Stable income */}
      <div className="nm-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">⚖️</span>
          <div>
            <p className="font-bold text-white text-sm">Stable income</p>
            <p className="text-xs" style={{ color: '#666' }}>Highest dividend shares</p>
          </div>
        </div>
        <div className="space-y-4">
          {[...STOCKS].sort((a, b) => b.dividendYieldAnnual - a.dividendYieldAnnual).slice(0, 3).map(s => (
            <div key={s.id} className="flex items-center justify-between">
              <button className="flex items-center gap-3 flex-1 text-left" onClick={() => setSelectedId(s.id)}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ background: s.color, boxShadow: `0 0 10px ${s.color}44` }}
                >
                  {s.ticker.slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{s.name}</p>
                  <p className="text-xs" style={{ color: '#FF6B00' }}>{(s.dividendYieldAnnual * 100).toFixed(2)}% yield</p>
                </div>
              </button>
              <button
                onClick={() => buyStock(s.id, 1)}
                disabled={balance < stockPrices[s.id]}
                className="nm-orange text-white px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-40"
                style={balance < stockPrices[s.id] ? { background: '#1e1e1e', boxShadow: NM_OUT } : undefined}
              >
                Buy
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => setShowMarket(true)} className="text-sm font-semibold mt-4" style={{ color: '#FF6B00' }}>
          Show all →
        </button>
      </div>

      {showMarket && <StockModal onClose={() => setShowMarket(false)} />}
      {selectedId && <StockDetailModal stockId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

function StockDetailModal({ stockId, onClose }: { stockId: string; onClose: () => void }) {
  const stock       = STOCKS.find(s => s.id === stockId)!;
  const stockPrices = useGameStore(s => s.stockPrices);
  const stockHoldings = useGameStore(s => s.stockHoldings);
  const balance     = useGameStore(s => s.balance);
  const buyStock    = useGameStore(s => s.buyStock);
  const sellStock   = useGameStore(s => s.sellStock);
  const soundEnabled = useGameStore(s => s.soundEnabled);

  const [qty, setQty] = useState(1);

  const price      = stockPrices[stockId];
  const holding    = stockHoldings[stockId];
  const changePct  = ((price - stock.basePrice) / stock.basePrice) * 100;
  const isUp       = changePct >= 0;
  const marketCap  = stock.marketCapBase * (price / stock.basePrice);
  const divPerShare = (price * stock.dividendYieldAnnual) / 8760;

  const holdingsValue   = holding ? holding.shares * price : 0;
  const holdingsCost    = holding ? holding.shares * holding.avgBuyPrice : 0;
  const holdingsGain    = holdingsValue - holdingsCost;
  const holdingsGainPct = holdingsCost > 0 ? (holdingsGain / holdingsCost) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-end" style={{ background: 'rgba(0,0,0,0.88)' }}>
      <div className="w-full max-h-[92vh] flex flex-col rounded-t-3xl" style={{ background: '#1a1a1a', boxShadow: '-2px -6px 30px #0a0a0a' }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid #2a2a2a' }}>
          <div
            className="w-13 h-13 w-12 h-12 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: stock.color, boxShadow: `0 0 18px ${stock.color}66` }}
          >
            {stock.ticker.slice(0, 3)}
          </div>
          <div className="flex-1">
            <p className="font-bold text-white text-lg leading-none">{stock.name}</p>
            <p className="text-xs mt-0.5" style={{ color: '#888' }}>{stock.ticker} · Equity</p>
          </div>
          <button className="nm-btn w-9 h-9 rounded-xl flex items-center justify-center" onClick={onClose}>
            <X size={18} color="#888" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4">
          {/* Live price */}
          <div>
            <p className="text-3xl font-bold text-white">Rs. {Math.round(price).toLocaleString('en-IN')}</p>
            <p className={`text-sm font-semibold flex items-center gap-1 mt-0.5 ${isUp ? 'text-green-500' : 'text-red-500'}`}>
              {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {isUp ? '+' : ''}{changePct.toFixed(2)}% from base price
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Market Cap',      value: `Rs. ${Math.round(marketCap).toLocaleString('en-IN')}` },
              { label: 'Annual Yield',    value: `${(stock.dividendYieldAnnual * 100).toFixed(2)}%` },
              { label: 'Dividend / hr',   value: `${formatCurrency(divPerShare)} / share` },
              { label: 'Base Price',      value: `Rs. ${Math.round(stock.basePrice).toLocaleString('en-IN')}` },
            ].map(stat => (
              <div key={stat.label} className="rounded-2xl p-3" style={{ background: '#161616', boxShadow: 'inset 2px 2px 5px #0d0d0d' }}>
                <p className="text-xs mb-0.5" style={{ color: '#666' }}>{stat.label}</p>
                <p className="font-bold text-white text-sm">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Holdings */}
          {holding ? (
            <div className="rounded-2xl p-4" style={{ background: '#1e1e1e', boxShadow: NM_OUT }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-widest" style={{ color: '#555' }}>My Holdings</p>
                {holding.shares >= STOCK_TOTAL_SHARES && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: '#1a3d1a', color: '#4CAF50' }}>✓ OWNED</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-y-2.5 text-sm mb-3">
                <span style={{ color: '#888' }}>Shares owned</span>
                <span className="font-bold text-white text-right">{holding.shares.toFixed(0)} / {STOCK_TOTAL_SHARES}</span>
                <span style={{ color: '#888' }}>Avg buy price</span>
                <span className="font-bold text-white text-right">Rs. {Math.round(holding.avgBuyPrice).toLocaleString('en-IN')}</span>
                <span style={{ color: '#888' }}>Current value</span>
                <span className="font-bold text-white text-right">Rs. {Math.round(holdingsValue).toLocaleString('en-IN')}</span>
                <span style={{ color: '#888' }}>Unrealized P&L</span>
                <span className={`font-bold text-right ${holdingsGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {holdingsGain >= 0 ? '+' : '-'}Rs. {Math.abs(Math.round(holdingsGain)).toLocaleString('en-IN')}<br />
                  <span className="text-xs font-semibold">({holdingsGainPct.toFixed(2)}%)</span>
                </span>
              </div>
              {/* Ownership progress */}
              <div>
                <div className="flex justify-between text-xs mb-1" style={{ color: '#666' }}>
                  <span>Ownership</span>
                  <span>{Math.min(100, (holding.shares / STOCK_TOTAL_SHARES) * 100).toFixed(1)}%</span>
                </div>
                <div className="rounded-full overflow-hidden" style={{ height: 5, background: '#2a2a2a' }}>
                  <div className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (holding.shares / STOCK_TOTAL_SHARES) * 100)}%`,
                      background: holding.shares >= STOCK_TOTAL_SHARES
                        ? 'linear-gradient(90deg,#2E7D32,#4CAF50)'
                        : 'linear-gradient(90deg,#7B3F00,#FF6B00)',
                    }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-4 text-center" style={{ background: '#161616', boxShadow: 'inset 2px 2px 5px #0d0d0d' }}>
              <p className="text-sm" style={{ color: '#555' }}>You don't own any shares yet.</p>
            </div>
          )}

          {/* Quantity selector */}
          <div className="rounded-2xl p-4" style={{ background: '#161616', boxShadow: 'inset 2px 2px 5px #0d0d0d' }}>
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#555' }}>Quantity</p>
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-xl font-bold text-white text-lg flex items-center justify-center active:scale-95 transition-all"
                style={{ background: '#1e1e1e', boxShadow: NM_OUT }}
              >−</button>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={e => setQty(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                className="flex-1 text-center font-bold text-white text-lg rounded-xl py-2 outline-none"
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
              />
              <button
                onClick={() => setQty(q => q + 1)}
                className="w-10 h-10 rounded-xl font-bold text-white text-lg flex items-center justify-center active:scale-95 transition-all"
                style={{ background: '#1e1e1e', boxShadow: NM_OUT }}
              >+</button>
              <button
                onClick={() => {
                  const max = Math.floor(balance / price);
                  setQty(max > 0 ? max : 1);
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all"
                style={{ background: '#1e1e1e', boxShadow: NM_OUT, color: '#FF6B00' }}
              >Max</button>
            </div>
            <div className="flex justify-between text-xs" style={{ color: '#666' }}>
              <span>Total cost</span>
              <span className="font-bold text-white">Rs. {Math.round(price * qty).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pb-2">
            <button
              onClick={() => { buyStock(stockId, qty); if (soundEnabled) playBuy(); }}
              disabled={balance < price * qty}
              className="flex-1 py-3 rounded-xl font-bold text-white disabled:opacity-40 active:scale-95 transition-all"
              style={{ background: balance >= price * qty ? 'linear-gradient(135deg,#7B3F00,#FF6B00)' : '#1e1e1e', boxShadow: balance >= price * qty ? '0 3px 10px rgba(255,107,0,0.3)' : NM_OUT }}
            >
              Buy {qty}
            </button>
            {holding && holding.shares >= qty && (
              <button
                onClick={() => { sellStock(stockId, qty); if (soundEnabled) playSell(); }}
                className="flex-1 py-3 rounded-xl font-bold active:scale-95 transition-all"
                style={{ background: '#1e1e1e', boxShadow: NM_OUT, color: '#4CAF50' }}
              >
                Sell {qty}
              </button>
            )}
            {holding && holding.shares > 0 && (
              <button
                onClick={() => { sellStock(stockId, holding.shares); if (soundEnabled) playSell(); }}
                className="px-4 py-3 rounded-xl font-bold active:scale-95 transition-all"
                style={{ background: '#1e1e1e', boxShadow: NM_OUT, color: '#ff5555' }}
              >
                All
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type StockSort = 'default' | 'price_asc' | 'price_desc' | 'gain' | 'loss';

function StockModal({ onClose }: { onClose: () => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [qty, setQty]   = useState(1);
  const [sort, setSort] = useState<StockSort>('default');

  const stockHoldings = useGameStore(s => s.stockHoldings);
  const stockPrices   = useGameStore(s => s.stockPrices);
  const balance       = useGameStore(s => s.balance);
  const buyStock      = useGameStore(s => s.buyStock);
  const sellStock     = useGameStore(s => s.sellStock);
  const soundEnabled  = useGameStore(s => s.soundEnabled);

  return (
    <>
    <div className="fixed inset-0 z-[60] flex items-end" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="w-full max-h-[85vh] flex flex-col rounded-t-3xl" style={{ background: '#1a1a1a', boxShadow: '-2px -6px 30px #0a0a0a' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #2a2a2a' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-lg text-white">Stock Market</h3>
              <p className="text-xs mt-0.5" style={{ color: '#666' }}>
                <span style={{ color: '#FF6B00' }}>{Object.values(stockHoldings).filter(h => h.shares >= STOCK_TOTAL_SHARES).length}</span>
                <span> / {STOCKS.length} companies owned · </span>
                <span style={{ color: '#888' }}>{Object.values(stockHoldings).filter(h => h.shares > 0).length} invested</span>
              </p>
            </div>
            <button className="nm-btn w-9 h-9 rounded-xl flex items-center justify-center" onClick={onClose}>
              <X size={18} color="#888" />
            </button>
          </div>
          {/* Quantity selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold shrink-0" style={{ color: '#666' }}>Qty</span>
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-lg font-bold text-white flex items-center justify-center active:scale-95"
              style={{ background: '#1e1e1e', boxShadow: NM_OUT }}
            >−</button>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={e => setQty(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
              className="w-16 text-center font-bold text-white text-sm rounded-lg py-1.5 outline-none"
              style={{ background: '#161616', border: '1px solid #2a2a2a' }}
            />
            <button
              onClick={() => setQty(q => q + 1)}
              className="w-8 h-8 rounded-lg font-bold text-white flex items-center justify-center active:scale-95"
              style={{ background: '#1e1e1e', boxShadow: NM_OUT }}
            >+</button>
            {[5, 10, 50].map(n => (
              <button
                key={n}
                onClick={() => setQty(n)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold active:scale-95"
                style={{ background: qty === n ? 'linear-gradient(135deg,#7B3F00,#FF6B00)' : '#1e1e1e', boxShadow: NM_OUT, color: qty === n ? '#fff' : '#888' }}
              >{n}</button>
            ))}
          </div>
          {/* Sort bar */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
            <span className="text-xs font-semibold shrink-0" style={{ color: '#666' }}>Sort</span>
            {([
              { key: 'default',    label: 'Default' },
              { key: 'price_asc',  label: '↑ Price' },
              { key: 'price_desc', label: '↓ Price' },
              { key: 'gain',       label: '📈 Gainers' },
              { key: 'loss',       label: '📉 Losers' },
            ] as { key: StockSort; label: string }[]).map(opt => (
              <button
                key={opt.key}
                onClick={() => setSort(opt.key)}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition-all"
                style={{
                  background: sort === opt.key ? 'linear-gradient(135deg,#7B3F00,#FF6B00)' : '#1e1e1e',
                  boxShadow: NM_OUT,
                  color: sort === opt.key ? '#fff' : '#888',
                }}
              >{opt.label}</button>
            ))}
          </div>
        </div>
        <div className="overflow-y-auto flex-1 min-h-0 p-4 space-y-3">
          {[...STOCKS].sort((a, b) => {
            const pa = stockPrices[a.id], pb = stockPrices[b.id];
            if (sort === 'price_asc')  return pa - pb;
            if (sort === 'price_desc') return pb - pa;
            if (sort === 'gain')  return ((pb - b.basePrice) / b.basePrice) - ((pa - a.basePrice) / a.basePrice);
            if (sort === 'loss')  return ((pa - a.basePrice) / a.basePrice) - ((pb - b.basePrice) / b.basePrice);
            return 0;
          }).map(s => {
            const price   = stockPrices[s.id];
            const holding = stockHoldings[s.id];
            const changePct = ((price - s.basePrice) / s.basePrice) * 100;
            const isUp = changePct >= 0;
            return (
              <div key={s.id} className="nm-card p-4">
                <button
                  className="flex items-center gap-3 w-full text-left mb-3"
                  onClick={() => setSelectedId(s.id)}
                >
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: s.color, boxShadow: `0 0 12px ${s.color}55` }}>
                    {s.ticker}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm">{s.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs" style={{ color: '#888' }}>Rs. {Math.round(price).toLocaleString('en-IN')}</p>
                      <p className={`text-xs font-semibold flex items-center gap-0.5 ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                        {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {Math.abs(changePct).toFixed(2)}%
                      </p>
                    </div>
                    {holding && (
                      <p className="text-xs" style={{ color: holding.shares >= STOCK_TOTAL_SHARES ? '#4CAF50' : '#FF6B00' }}>
                        {holding.shares >= STOCK_TOTAL_SHARES
                          ? `✓ Owned · Rs. ${Math.round(holding.shares * price).toLocaleString('en-IN')}`
                          : `${holding.shares.toFixed(0)} / ${STOCK_TOTAL_SHARES} shares · Rs. ${Math.round(holding.shares * price).toLocaleString('en-IN')}`}
                      </p>
                    )}
                  </div>
                  <ChevronRight size={14} color="#444" />
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => { buyStock(s.id, qty); if (soundEnabled) playBuy(); }}
                    disabled={balance < price * qty}
                    className="flex-1 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-40"
                    style={{ background: balance >= price * qty ? 'linear-gradient(135deg,#7B3F00,#FF6B00)' : '#1e1e1e', boxShadow: balance >= price * qty ? '0 3px 10px rgba(255,107,0,0.3)' : NM_OUT }}
                  >
                    Buy {qty}
                  </button>
                  {holding && holding.shares >= qty && (
                    <button
                      onClick={() => { sellStock(s.id, qty); if (soundEnabled) playSell(); }}
                      className="flex-1 py-2 rounded-xl text-sm font-bold"
                      style={{ background: '#1e1e1e', boxShadow: NM_OUT, color: '#4CAF50' }}
                    >
                      Sell {qty}
                    </button>
                  )}
                  {holding && holding.shares > 0 && (
                    <button
                      onClick={() => { sellStock(s.id, holding.shares); if (soundEnabled) playSell(); }}
                      className="px-3 py-2 rounded-xl text-sm font-bold"
                      style={{ background: '#1e1e1e', boxShadow: NM_OUT, color: '#ff5555' }}
                    >
                      All
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    {selectedId && <StockDetailModal stockId={selectedId} onClose={() => setSelectedId(null)} />}
    </>
  );
}

function RealEstateTab() {
  const [showMarket, setShowMarket] = useState(false);

  const propertyHoldings       = useGameStore(s => s.propertyHoldings);
  const propertyLevels         = useGameStore(s => s.propertyLevels);
  const balance                = useGameStore(s => s.balance);
  const buyProperty            = useGameStore(s => s.buyProperty);
  const upgradeProperty        = useGameStore(s => s.upgradeProperty);
  const getRentalIncomePerHour = useGameStore(s => s.getRentalIncomePerHour);

  const rentalIncome = getRentalIncomePerHour();
  const owned = PROPERTIES.filter(p => propertyHoldings.includes(p.id));

  return (
    <div className="p-4 space-y-4">
      {/* Rental income display */}
      <div className="nm-in rounded-3xl p-6 text-center">
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#555' }}>Rental Income / Hour</p>
        <p className="text-3xl font-bold" style={{ color: '#FF6B00' }}>{formatCurrency(rentalIncome)}</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="text-sm font-bold text-white">{owned.length}</span>
          <span className="text-xs" style={{ color: '#555' }}>/</span>
          <span className="text-sm font-bold" style={{ color: '#FF6B00' }}>{PROPERTIES.length}</span>
          <span className="text-xs" style={{ color: '#666' }}>properties owned</span>
        </div>
        <div className="mt-2 mx-4 rounded-full overflow-hidden" style={{ height: 4, background: '#2a2a2a' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${(owned.length / PROPERTIES.length) * 100}%`, background: 'linear-gradient(90deg,#FF8C00,#FF5500)' }}
          />
        </div>
      </div>

      {/* Market button */}
      <button
        onClick={() => setShowMarket(true)}
        className="nm-card w-full p-5 text-left flex items-center gap-4"
      >
        <span className="text-3xl">🏘️</span>
        <div className="flex-1">
          <p className="font-bold text-white">Real estate market</p>
          <p className="text-sm" style={{ color: '#888' }}>Buy properties worldwide, earn rental income</p>
        </div>
        <ChevronRight size={18} color="#555" />
      </button>

      {/* My properties */}
      <div className="nm-card p-4">
        <p className="font-bold text-white mb-3">My property</p>
        {owned.length === 0 ? (
          <p className="text-sm text-center py-4" style={{ color: '#555' }}>No properties yet.</p>
        ) : (
          <div className="space-y-3">
            {owned.map(p => {
              const level       = propertyLevels[p.id] ?? 1;
              const income      = p.rentalIncomePerHour * level;
              const upgradeCost = p.cost * 0.5 * level;
              const maxed       = level >= 10;
              const canUpgrade  = !maxed && balance >= upgradeCost;
              return (
                <div key={p.id} className="rounded-2xl p-3" style={{ background: '#161616', boxShadow: 'inset 2px 2px 5px #0d0d0d' }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-white text-sm">{p.name}</p>
                        <span className="text-xs px-1.5 py-0.5 rounded-md font-bold"
                          style={{ background: maxed ? '#7B3F00' : '#2a2a2a', color: maxed ? '#FF8C00' : '#FF6B00' }}>
                          Lv.{level}{maxed ? ' MAX' : ''}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: '#555' }}>{p.location}</p>
                    </div>
                    <span className="font-bold text-sm shrink-0" style={{ color: '#FF6B00' }}>
                      {formatCurrency(income)}/hr
                    </span>
                  </div>
                  {!maxed && (
                    <button
                      onClick={() => upgradeProperty(p.id)}
                      disabled={!canUpgrade}
                      className="w-full py-2 rounded-xl text-xs font-bold disabled:opacity-40"
                      style={{
                        background: canUpgrade ? 'linear-gradient(135deg,#7B3F00,#FF6B00)' : '#1e1e1e',
                        boxShadow: canUpgrade ? '0 2px 8px rgba(255,107,0,0.3)' : NM_OUT,
                        color: '#fff',
                      }}
                    >
                      Upgrade → Lv.{level + 1} &nbsp;·&nbsp; {formatCurrency(upgradeCost)} &nbsp;·&nbsp; +{formatCurrency(p.rentalIncomePerHour)}/hr
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showMarket && (
        <div className="fixed inset-0 z-[60] flex items-end" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="w-full max-h-[85vh] flex flex-col rounded-t-3xl" style={{ background: '#1a1a1a', boxShadow: '-2px -6px 30px #0a0a0a' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #2a2a2a' }}>
              <div>
                <h3 className="font-bold text-lg text-white">Real Estate Market</h3>
                <p className="text-xs mt-0.5" style={{ color: '#666' }}>
                  <span style={{ color: '#FF6B00' }}>{owned.length}</span>
                  <span> / {PROPERTIES.length} properties owned</span>
                </p>
              </div>
              <button className="nm-btn w-9 h-9 rounded-xl flex items-center justify-center" onClick={() => setShowMarket(false)}>
                <X size={18} color="#888" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 min-h-0 p-4 pb-8 space-y-3">
              {PROPERTIES.map(p => {
                const isOwned     = propertyHoldings.includes(p.id);
                const level       = propertyLevels[p.id] ?? 1;
                const income      = isOwned ? p.rentalIncomePerHour * level : p.rentalIncomePerHour;
                const upgradeCost = p.cost * 0.5 * level;
                const maxed       = level >= 10;
                return (
                  <div key={p.id} className="nm-card p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-white text-sm">{p.name}</p>
                          {isOwned && (
                            <span className="text-xs px-1.5 py-0.5 rounded-md font-bold"
                              style={{ background: maxed ? '#7B3F00' : '#2a2a2a', color: maxed ? '#FF8C00' : '#FF6B00' }}>
                              Lv.{level}{maxed ? ' MAX' : ''}
                            </span>
                          )}
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: '#666' }}>{p.location}</p>
                        <p className="text-xs font-semibold mt-0.5" style={{ color: '#FF6B00' }}>{formatCurrency(income)}/hr</p>
                      </div>
                      {isOwned ? (
                        <button
                          onClick={() => upgradeProperty(p.id)}
                          disabled={maxed || balance < upgradeCost}
                          className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold disabled:opacity-40"
                          style={{
                            background: (!maxed && balance >= upgradeCost) ? 'linear-gradient(135deg,#7B3F00,#FF6B00)' : '#1e1e1e',
                            boxShadow: (!maxed && balance >= upgradeCost) ? '0 2px 8px rgba(255,107,0,0.3)' : NM_OUT,
                            color: '#fff',
                          }}
                        >
                          {maxed ? 'MAX' : `Upgrade\n${formatCurrency(upgradeCost)}`}
                        </button>
                      ) : (
                        <button
                          onClick={() => buyProperty(p.id)}
                          disabled={balance < p.cost}
                          className="nm-orange text-white px-4 py-2 rounded-xl text-sm font-bold shrink-0 disabled:opacity-40"
                          style={balance < p.cost ? { background: '#1e1e1e', boxShadow: NM_OUT } : undefined}
                        >
                          {formatCurrency(p.cost)}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CryptoDetailModal({ coinId, onClose }: { coinId: string; onClose: () => void }) {
  const coin           = CRYPTOS.find(c => c.id === coinId)!;
  const cryptoPrices   = useGameStore(s => s.cryptoPrices);
  const cryptoHoldings = useGameStore(s => s.cryptoHoldings);
  const balance        = useGameStore(s => s.balance);
  const buyCrypto      = useGameStore(s => s.buyCrypto);
  const sellCrypto     = useGameStore(s => s.sellCrypto);
  const soundEnabled   = useGameStore(s => s.soundEnabled);

  const [qty, setQty] = useState(1);

  const price     = cryptoPrices[coinId];
  const holding   = cryptoHoldings[coinId];
  const changePct = ((price - coin.basePrice) / coin.basePrice) * 100;
  const isUp      = changePct >= 0;
  const marketCap = coin.totalSupply * price;

  const holdingsValue   = holding ? holding.amount * price : 0;
  const holdingsCost    = holding ? holding.amount * holding.avgBuyPrice : 0;
  const holdingsGain    = holdingsValue - holdingsCost;
  const holdingsGainPct = holdingsCost > 0 ? (holdingsGain / holdingsCost) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[70] flex items-end" style={{ background: 'rgba(0,0,0,0.88)' }}>
      <div className="w-full max-h-[92vh] flex flex-col rounded-t-3xl" style={{ background: '#1a1a1a', boxShadow: '-2px -6px 30px #0a0a0a' }}>
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid #2a2a2a' }}>
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: coin.color, boxShadow: `0 0 18px ${coin.color}66` }}
          >
            {coin.ticker.slice(0, 3)}
          </div>
          <div className="flex-1">
            <p className="font-bold text-white text-lg leading-none">{coin.name}</p>
            <p className="text-xs mt-0.5" style={{ color: '#888' }}>{coin.ticker} · Crypto</p>
          </div>
          <button className="nm-btn w-9 h-9 rounded-xl flex items-center justify-center" onClick={onClose}>
            <X size={18} color="#888" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4">
          {/* Live price */}
          <div>
            <p className="text-3xl font-bold text-white">{formatCurrency(price)}</p>
            <p className={`text-sm font-semibold flex items-center gap-1 mt-0.5 ${isUp ? 'text-green-500' : 'text-red-500'}`}>
              {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {isUp ? '+' : ''}{changePct.toFixed(2)}% from base price
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Market Cap',   value: formatCurrency(marketCap) },
              { label: 'Total Supply', value: coin.totalSupply.toLocaleString('en-IN') },
              { label: 'Base Price',   value: formatCurrency(coin.basePrice) },
              { label: 'Ticker',       value: coin.ticker },
            ].map(stat => (
              <div key={stat.label} className="rounded-2xl p-3" style={{ background: '#161616', boxShadow: 'inset 2px 2px 5px #0d0d0d' }}>
                <p className="text-xs mb-0.5" style={{ color: '#666' }}>{stat.label}</p>
                <p className="font-bold text-white text-sm">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Holdings */}
          {holding && holding.amount > 0 ? (
            <div className="rounded-2xl p-4" style={{ background: '#1e1e1e', boxShadow: NM_OUT }}>
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#555' }}>My Holdings</p>
              <div className="grid grid-cols-2 gap-y-2.5 text-sm">
                <span style={{ color: '#888' }}>Amount owned</span>
                <span className="font-bold text-white text-right">{holding.amount.toLocaleString('en-IN', { maximumFractionDigits: 4 })} {coin.ticker}</span>
                <span style={{ color: '#888' }}>Avg buy price</span>
                <span className="font-bold text-white text-right">{formatCurrency(holding.avgBuyPrice)}</span>
                <span style={{ color: '#888' }}>Current value</span>
                <span className="font-bold text-white text-right">{formatCurrency(holdingsValue)}</span>
                <span style={{ color: '#888' }}>Unrealized P&L</span>
                <span className={`font-bold text-right ${holdingsGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {holdingsGain >= 0 ? '+' : '-'}{formatCurrency(Math.abs(holdingsGain))}<br />
                  <span className="text-xs font-semibold">({holdingsGainPct.toFixed(2)}%)</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-4 text-center" style={{ background: '#161616', boxShadow: 'inset 2px 2px 5px #0d0d0d' }}>
              <p className="text-sm" style={{ color: '#555' }}>You don't own any {coin.ticker} yet.</p>
            </div>
          )}

          {/* Quantity selector */}
          <div className="rounded-2xl p-4" style={{ background: '#161616', boxShadow: 'inset 2px 2px 5px #0d0d0d' }}>
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#555' }}>Quantity</p>
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-xl font-bold text-white text-lg flex items-center justify-center active:scale-95 transition-all"
                style={{ background: '#1e1e1e', boxShadow: NM_OUT }}
              >−</button>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={e => setQty(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                className="flex-1 text-center font-bold text-white text-lg rounded-xl py-2 outline-none"
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
              />
              <button
                onClick={() => setQty(q => q + 1)}
                className="w-10 h-10 rounded-xl font-bold text-white text-lg flex items-center justify-center active:scale-95 transition-all"
                style={{ background: '#1e1e1e', boxShadow: NM_OUT }}
              >+</button>
              <button
                onClick={() => { const max = Math.floor(balance / price); setQty(max > 0 ? max : 1); }}
                className="px-3 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all"
                style={{ background: '#1e1e1e', boxShadow: NM_OUT, color: '#FF6B00' }}
              >Max</button>
            </div>
            <div className="flex justify-between text-xs" style={{ color: '#666' }}>
              <span>Total cost</span>
              <span className="font-bold text-white">{formatCurrency(price * qty)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pb-2">
            <button
              onClick={() => { buyCrypto(coinId, qty); if (soundEnabled) playBuy(); }}
              disabled={balance < price * qty}
              className="flex-1 py-3 rounded-xl font-bold text-white disabled:opacity-40 active:scale-95 transition-all"
              style={{ background: balance >= price * qty ? 'linear-gradient(135deg,#7B3F00,#FF6B00)' : '#1e1e1e', boxShadow: balance >= price * qty ? '0 3px 10px rgba(255,107,0,0.3)' : NM_OUT }}
            >
              Buy {qty}
            </button>
            {holding && holding.amount >= qty && (
              <button
                onClick={() => { sellCrypto(coinId, qty); if (soundEnabled) playSell(); }}
                className="flex-1 py-3 rounded-xl font-bold active:scale-95 transition-all"
                style={{ background: '#1e1e1e', boxShadow: NM_OUT, color: '#4CAF50' }}
              >
                Sell {qty}
              </button>
            )}
            {holding && holding.amount > 0 && (
              <button
                onClick={() => { sellCrypto(coinId, holding.amount); if (soundEnabled) playSell(); }}
                className="px-4 py-3 rounded-xl font-bold active:scale-95 transition-all"
                style={{ background: '#1e1e1e', boxShadow: NM_OUT, color: '#ff5555' }}
              >
                All
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type CryptoSort = 'default' | 'price_asc' | 'price_desc' | 'gain' | 'loss';

function CryptoModal({ onClose }: { onClose: () => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [qty, setQty]   = useState(1);
  const [sort, setSort] = useState<CryptoSort>('default');

  const cryptoHoldings = useGameStore(s => s.cryptoHoldings);
  const cryptoPrices   = useGameStore(s => s.cryptoPrices);
  const balance        = useGameStore(s => s.balance);
  const buyCrypto      = useGameStore(s => s.buyCrypto);
  const sellCrypto     = useGameStore(s => s.sellCrypto);
  const soundEnabled   = useGameStore(s => s.soundEnabled);

  const investedCount = CRYPTOS.filter(c => (cryptoHoldings[c.id]?.amount ?? 0) > 0).length;

  return (
    <>
    <div className="fixed inset-0 z-[60] flex items-end" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="w-full max-h-[85vh] flex flex-col rounded-t-3xl" style={{ background: '#1a1a1a', boxShadow: '-2px -6px 30px #0a0a0a' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #2a2a2a' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-lg text-white">Crypto Market</h3>
              <p className="text-xs mt-0.5" style={{ color: '#666' }}>
                <span style={{ color: '#FF6B00' }}>{investedCount}</span>
                <span> / {CRYPTOS.length} coins invested</span>
              </p>
            </div>
            <button className="nm-btn w-9 h-9 rounded-xl flex items-center justify-center" onClick={onClose}>
              <X size={18} color="#888" />
            </button>
          </div>
          {/* Quantity selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold shrink-0" style={{ color: '#666' }}>Qty</span>
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-lg font-bold text-white flex items-center justify-center active:scale-95"
              style={{ background: '#1e1e1e', boxShadow: NM_OUT }}
            >−</button>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={e => setQty(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
              className="w-16 text-center font-bold text-white text-sm rounded-lg py-1.5 outline-none"
              style={{ background: '#161616', border: '1px solid #2a2a2a' }}
            />
            <button
              onClick={() => setQty(q => q + 1)}
              className="w-8 h-8 rounded-lg font-bold text-white flex items-center justify-center active:scale-95"
              style={{ background: '#1e1e1e', boxShadow: NM_OUT }}
            >+</button>
            {[5, 10, 50].map(n => (
              <button
                key={n}
                onClick={() => setQty(n)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold active:scale-95"
                style={{ background: qty === n ? 'linear-gradient(135deg,#7B3F00,#FF6B00)' : '#1e1e1e', boxShadow: NM_OUT, color: qty === n ? '#fff' : '#888' }}
              >{n}</button>
            ))}
          </div>
          {/* Sort bar */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
            <span className="text-xs font-semibold shrink-0" style={{ color: '#666' }}>Sort</span>
            {([
              { key: 'default',    label: 'Default' },
              { key: 'price_asc',  label: '↑ Price' },
              { key: 'price_desc', label: '↓ Price' },
              { key: 'gain',       label: '📈 Gainers' },
              { key: 'loss',       label: '📉 Losers' },
            ] as { key: CryptoSort; label: string }[]).map(opt => (
              <button
                key={opt.key}
                onClick={() => setSort(opt.key)}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition-all"
                style={{
                  background: sort === opt.key ? 'linear-gradient(135deg,#7B3F00,#FF6B00)' : '#1e1e1e',
                  boxShadow: NM_OUT,
                  color: sort === opt.key ? '#fff' : '#888',
                }}
              >{opt.label}</button>
            ))}
          </div>
        </div>
        <div className="overflow-y-auto flex-1 min-h-0 p-4 space-y-3">
          {[...CRYPTOS].sort((a, b) => {
            const pa = cryptoPrices[a.id], pb = cryptoPrices[b.id];
            if (sort === 'price_asc')  return pa - pb;
            if (sort === 'price_desc') return pb - pa;
            if (sort === 'gain')  return ((pb - b.basePrice) / b.basePrice) - ((pa - a.basePrice) / a.basePrice);
            if (sort === 'loss')  return ((pa - a.basePrice) / a.basePrice) - ((pb - b.basePrice) / b.basePrice);
            return 0;
          }).map(coin => {
            const price     = cryptoPrices[coin.id];
            const holding   = cryptoHoldings[coin.id];
            const changePct = ((price - coin.basePrice) / coin.basePrice) * 100;
            const isUp      = changePct >= 0;
            return (
              <div key={coin.id} className="nm-card p-4">
                <button
                  className="flex items-center gap-3 w-full text-left mb-3"
                  onClick={() => setSelectedId(coin.id)}
                >
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: coin.color, boxShadow: `0 0 12px ${coin.color}55` }}>
                    {coin.ticker}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm">{coin.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs" style={{ color: '#888' }}>{formatCurrency(price)}</p>
                      <p className={`text-xs font-semibold flex items-center gap-0.5 ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                        {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {Math.abs(changePct).toFixed(2)}%
                      </p>
                    </div>
                    {holding && holding.amount > 0 && (
                      <p className="text-xs" style={{ color: '#FF6B00' }}>
                        {holding.amount.toLocaleString('en-IN', { maximumFractionDigits: 4 })} {coin.ticker} · {formatCurrency(holding.amount * price)}
                      </p>
                    )}
                  </div>
                  <ChevronRight size={14} color="#444" />
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => { buyCrypto(coin.id, qty); if (soundEnabled) playBuy(); }}
                    disabled={balance < price * qty}
                    className="flex-1 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-40"
                    style={{ background: balance >= price * qty ? 'linear-gradient(135deg,#7B3F00,#FF6B00)' : '#1e1e1e', boxShadow: balance >= price * qty ? '0 3px 10px rgba(255,107,0,0.3)' : NM_OUT }}
                  >
                    Buy {qty}
                  </button>
                  {holding && holding.amount >= qty && (
                    <button
                      onClick={() => { sellCrypto(coin.id, qty); if (soundEnabled) playSell(); }}
                      className="flex-1 py-2 rounded-xl text-sm font-bold"
                      style={{ background: '#1e1e1e', boxShadow: NM_OUT, color: '#4CAF50' }}
                    >
                      Sell {qty}
                    </button>
                  )}
                  {holding && holding.amount > 0 && (
                    <button
                      onClick={() => { sellCrypto(coin.id, holding.amount); if (soundEnabled) playSell(); }}
                      className="px-3 py-2 rounded-xl text-sm font-bold"
                      style={{ background: '#1e1e1e', boxShadow: NM_OUT, color: '#ff5555' }}
                    >
                      All
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    {selectedId && <CryptoDetailModal coinId={selectedId} onClose={() => setSelectedId(null)} />}
    </>
  );
}

function CryptoTab() {
  const [showMarket, setShowMarket] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const cryptoHoldings          = useGameStore(s => s.cryptoHoldings);
  const cryptoPrices            = useGameStore(s => s.cryptoPrices);
  const balance                 = useGameStore(s => s.balance);
  const buyCrypto               = useGameStore(s => s.buyCrypto);
  const getCryptoPortfolioValue = useGameStore(s => s.getCryptoPortfolioValue);
  const soundEnabled            = useGameStore(s => s.soundEnabled);

  const totalValue    = getCryptoPortfolioValue();
  const costBasis     = CRYPTOS.reduce((t, c) => { const h = cryptoHoldings[c.id]; return h ? t + h.amount * h.avgBuyPrice : t; }, 0);
  const gain          = totalValue - costBasis;
  const gainPct       = costBasis > 0 ? (gain / costBasis) * 100 : 0;
  const investedCount = CRYPTOS.filter(c => (cryptoHoldings[c.id]?.amount ?? 0) > 0).length;

  return (
    <div className="p-4 space-y-4">
      {/* Portfolio card */}
      <div className="nm-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">₿</span>
            <span className="font-semibold text-white text-sm">My crypto portfolio</span>
          </div>
          <ChevronRight size={16} color="#555" />
        </div>
        <p className="text-xs" style={{ color: '#888' }}>Portfolio value</p>
        <p className="text-2xl font-bold text-white mt-0.5">{formatCurrency(totalValue)}</p>
        {gain !== 0 && (
          <p className={`text-sm font-semibold mt-1 flex items-center gap-1 ${gain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {gain >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {gain >= 0 ? '+' : '-'}{formatCurrency(Math.abs(gain))} ({Math.abs(gainPct).toFixed(2)}%) all time
          </p>
        )}
        <div className="h-px mt-3 mb-3" style={{ background: '#2a2a2a' }} />
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs" style={{ color: '#888' }}>Coins invested</p>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-white">{investedCount}</span>
            <span className="text-xs" style={{ color: '#555' }}>/</span>
            <span className="text-sm font-bold" style={{ color: '#FF6B00' }}>{CRYPTOS.length}</span>
          </div>
        </div>
        <div className="rounded-full overflow-hidden" style={{ height: 4, background: '#2a2a2a' }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${(investedCount / CRYPTOS.length) * 100}%`, background: 'linear-gradient(90deg,#FF8C00,#FF5500)' }} />
        </div>
      </div>

      {/* Crypto market button */}
      <button
        onClick={() => setShowMarket(true)}
        className="nm-orange w-full rounded-2xl p-4 flex items-center justify-between text-white"
      >
        <div className="text-left">
          <p className="font-bold">Crypto market</p>
          <p className="text-sm opacity-70">Trade all available coins</p>
        </div>
        <ChevronRight size={20} />
      </button>

      {/* Top movers */}
      <div className="nm-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">📊</span>
          <div>
            <p className="font-bold text-white text-sm">Top movers</p>
            <p className="text-xs" style={{ color: '#666' }}>Highest price movement</p>
          </div>
        </div>
        <div className="space-y-4">
          {[...CRYPTOS].sort((a, b) =>
            Math.abs((cryptoPrices[b.id] - b.basePrice) / b.basePrice) -
            Math.abs((cryptoPrices[a.id] - a.basePrice) / a.basePrice)
          ).slice(0, 3).map(coin => {
            const price     = cryptoPrices[coin.id];
            const changePct = ((price - coin.basePrice) / coin.basePrice) * 100;
            const isUp      = changePct >= 0;
            return (
              <div key={coin.id} className="flex items-center justify-between">
                <button className="flex items-center gap-3 flex-1 text-left" onClick={() => setSelectedId(coin.id)}>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: coin.color, boxShadow: `0 0 10px ${coin.color}44` }}
                  >
                    {coin.ticker.slice(0, 3)}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{coin.name}</p>
                    <p className={`text-xs font-semibold flex items-center gap-0.5 ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                      {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {isUp ? '+' : ''}{changePct.toFixed(2)}%
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => { buyCrypto(coin.id, 1); if (soundEnabled) playBuy(); }}
                  disabled={balance < price}
                  className="nm-orange text-white px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-40"
                  style={balance < price ? { background: '#1e1e1e', boxShadow: NM_OUT } : undefined}
                >
                  Buy
                </button>
              </div>
            );
          })}
        </div>
        <button onClick={() => setShowMarket(true)} className="text-sm font-semibold mt-4" style={{ color: '#FF6B00' }}>
          Show all →
        </button>
      </div>

      {showMarket  && <CryptoModal onClose={() => setShowMarket(false)} />}
      {selectedId  && <CryptoDetailModal coinId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

export function InvestingPage() {
  const [tab, setTab] = useState<InvestTab>('shares');

  const tabs: { key: InvestTab; label: string }[] = [
    { key: 'shares',     label: 'Shares' },
    { key: 'realestate', label: 'Real Estate' },
    { key: 'crypto',     label: 'Cryptocurrency' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#1a1a1a' }}>
      {/* Header + tab strip */}
      <div className="px-4 pt-12 pb-0 sticky top-0 z-10" style={{ background: '#1a1a1a' }}>
        <h1 className="text-2xl font-bold text-white mb-4">Investing</h1>
        <div
          className="flex rounded-2xl p-1 gap-1 mb-0"
          style={{ background: '#161616', boxShadow: NM_IN }}
        >
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={
                tab === t.key
                  ? { background: 'linear-gradient(135deg, #FF8C00, #FF5500)', color: '#fff', boxShadow: '2px 2px 8px rgba(255,107,0,0.4)' }
                  : { color: '#666' }
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'shares'     && <SharesTab />}
      {tab === 'realestate' && <RealEstateTab />}
      {tab === 'crypto'     && <CryptoTab />}
    </div>
  );
}
