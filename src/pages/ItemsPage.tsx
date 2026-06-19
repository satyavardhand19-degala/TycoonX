import { useState } from 'react';
import { X, ChevronUp } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { formatCurrency } from '../utils/format';
import { CARS, PLANES, YACHTS, RESIDENCE_TIERS, COIN_COLLECTION, PAINTING_COLLECTION } from '../data/gameData';

type ShopType = 'cars' | 'planes' | 'yachts' | 'coins' | 'paintings' | null;

const NM_OUT = 'var(--nm-out)';
const NM_IN  = 'var(--nm-in)';

const SHOP_TITLE: Record<NonNullable<ShopType>, string> = {
  cars: 'Car Showroom', planes: 'Aircraft Shop', yachts: 'Yacht Shop',
  coins: 'Coin Collection', paintings: 'Painting Collection',
};

export function ItemsPage() {
  const [shop, setShop] = useState<ShopType>(null);

  const ownedCars          = useGameStore(s => s.ownedCars);
  const ownedPlanes        = useGameStore(s => s.ownedPlanes);
  const ownedYachts        = useGameStore(s => s.ownedYachts);
  const residenceLevel     = useGameStore(s => s.residenceLevel);
  const coinCollection     = useGameStore(s => s.coinCollection);
  const paintingCollection = useGameStore(s => s.paintingCollection);
  const balance            = useGameStore(s => s.balance);
  const buyCar             = useGameStore(s => s.buyCar);
  const buyPlane           = useGameStore(s => s.buyPlane);
  const buyYacht           = useGameStore(s => s.buyYacht);
  const upgradeResidence   = useGameStore(s => s.upgradeResidence);
  const buyCollectionItem  = useGameStore(s => s.buyCollectionItem);
  const getResidenceValue  = useGameStore(s => s.getResidenceValue);

  const currentTier = RESIDENCE_TIERS[residenceLevel];
  const nextTier    = RESIDENCE_TIERS[residenceLevel + 1];
  const coinsOwned  = coinCollection.filter(Boolean).length;
  const paintOwned  = paintingCollection.filter(Boolean).length;

  return (
    <div className="min-h-screen pb-6" style={{ background: 'var(--bg-base)' }}>
      <div className="px-4 pt-12">
        <h1 className="text-2xl font-bold text-white mb-5">Items</h1>

        {/* Gallery tiles */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[
            { label: 'Garage', icon: '🚗', shop: 'cars'   as ShopType, count: ownedCars.length,   total: CARS.length   },
            { label: 'Hangar', icon: '✈️', shop: 'planes' as ShopType, count: ownedPlanes.length, total: PLANES.length },
            { label: 'Harbor', icon: '🛥️', shop: 'yachts' as ShopType, count: ownedYachts.length, total: YACHTS.length },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => setShop(item.shop)}
              className="nm-btn rounded-2xl h-28 flex flex-col items-center justify-center gap-1 relative overflow-hidden"
            >
              <span className="text-4xl">{item.icon}</span>
              <span className="text-white font-semibold text-xs">{item.label}</span>
              <span
                className="absolute top-2 right-2 text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: '#FF6B00', color: '#fff', fontSize: 9 }}
              >
                {item.count}/{item.total}
              </span>
            </button>
          ))}
        </div>

        {/* Shop tiles */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Car Showroom',  icon: '🏎️', shop: 'cars'   as ShopType },
            { label: 'Aircraft Shop', icon: '✈️',  shop: 'planes' as ShopType },
            { label: 'Yacht Shop',    icon: '⛵',  shop: 'yachts' as ShopType },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => setShop(item.shop)}
              className="nm-btn rounded-2xl py-4 flex flex-col items-center gap-1.5"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-semibold text-center leading-tight px-1" style={{ color: '#FF6B00' }}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Residence */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ background: 'var(--bg-card)', boxShadow: NM_OUT, borderLeft: '3px solid #FF6B00' }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider" style={{ color: '#FF6B00' }}>Residence</p>
              <p className="font-bold text-white text-lg mt-0.5">{currentTier.name}</p>
              <p className="text-2xl font-bold mt-1 text-white">{formatCurrency(getResidenceValue())}</p>
            </div>
            {nextTier && (
              <button
                onClick={upgradeResidence}
                disabled={balance < nextTier.cost}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold shrink-0 disabled:opacity-40"
                style={
                  balance >= nextTier.cost
                    ? { background: 'linear-gradient(135deg, #FF8C00, #FF5500)', color: '#fff', boxShadow: '3px 3px 10px rgba(255,107,0,0.4)' }
                    : { background: 'var(--bg-deep)', color: '#555', boxShadow: NM_IN }
                }
              >
                <ChevronUp size={14} />
                Lv.{nextTier.level}
              </button>
            )}
          </div>
          {/* Progress bar */}
          <div className="h-1.5 rounded-full mt-4" style={{ background: 'var(--bg-deep)', boxShadow: NM_IN }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(residenceLevel / (RESIDENCE_TIERS.length - 1)) * 100}%`,
                background: 'linear-gradient(90deg, #FF6B00, #FF8C00)',
                boxShadow: '0 0 8px rgba(255,107,0,0.5)',
              }}
            />
          </div>
          {nextTier && (
            <p className="text-xs mt-2" style={{ color: '#555' }}>
              Next: {nextTier.name} — {formatCurrency(nextTier.cost)}
            </p>
          )}
        </div>

        {/* Collections */}
        <h2 className="font-bold text-white text-lg mb-3">Collections</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Coins',    icon: '🪙', count: coinsOwned,  total: COIN_COLLECTION.length,    shop: 'coins'    as ShopType },
            { label: 'Paintings', icon: '🖼️', count: paintOwned, total: PAINTING_COLLECTION.length, shop: 'paintings' as ShopType },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => setShop(item.shop)}
              className="nm-btn rounded-2xl py-7 flex flex-col items-center gap-2"
            >
              <span className="text-5xl">{item.icon}</span>
              <p className="font-bold text-white">{item.label}</p>
              <p className="text-xs" style={{ color: item.count === item.total ? '#FF6B00' : '#666' }}>
                {item.count} of {item.total}
                {item.count === item.total && ' ✓'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Shop modal */}
      {shop && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="w-full max-h-[85vh] flex flex-col rounded-t-3xl" style={{ background: 'var(--bg-base)', boxShadow: '-2px -6px 30px #0a0a0a' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 className="font-bold text-lg text-white">{SHOP_TITLE[shop]}</h3>
              <button className="nm-btn w-9 h-9 rounded-xl flex items-center justify-center" onClick={() => setShop(null)}>
                <X size={18} color="#888" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3">
              {shop === 'cars'   && CARS.map(v    => <VRow key={v.id} item={v} owned={ownedCars.includes(v.id)}     canBuy={balance >= v.cost} onBuy={() => buyCar(v.id)} />)}
              {shop === 'planes' && PLANES.map(v  => <VRow key={v.id} item={v} owned={ownedPlanes.includes(v.id)}   canBuy={balance >= v.cost} onBuy={() => buyPlane(v.id)} />)}
              {shop === 'yachts' && YACHTS.map(v  => <VRow key={v.id} item={v} owned={ownedYachts.includes(v.id)}   canBuy={balance >= v.cost} onBuy={() => buyYacht(v.id)} />)}
              {shop === 'coins'  && COIN_COLLECTION.map((item, i) =>
                <CRow key={item.id} emoji={item.emoji} name={item.name} cost={item.cost} owned={coinCollection[i]} canBuy={balance >= item.cost} onBuy={() => buyCollectionItem('coin', i)} />)}
              {shop === 'paintings' && PAINTING_COLLECTION.map((item, i) =>
                <CRow key={item.id} emoji={item.emoji} name={item.name} cost={item.cost} owned={paintingCollection[i]} canBuy={balance >= item.cost} onBuy={() => buyCollectionItem('painting', i)} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VRow({ item, owned, canBuy, onBuy }: { item: { emoji: string; name: string; brand: string; cost: number }; owned: boolean; canBuy: boolean; onBuy: () => void }) {
  return (
    <div className="nm-card p-4 flex items-center gap-3">
      <span className="text-3xl">{item.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm">{item.name}</p>
        <p className="text-xs" style={{ color: '#666' }}>{item.brand}</p>
      </div>
      {owned ? (
        <span className="text-sm font-bold text-green-500 shrink-0">Owned ✓</span>
      ) : (
        <button
          onClick={onBuy}
          disabled={!canBuy}
          className="nm-orange text-white px-4 py-2 rounded-xl text-sm font-bold shrink-0 disabled:opacity-40"
          style={!canBuy ? { background: 'var(--bg-card)', boxShadow: NM_OUT } : undefined}
        >
          {formatCurrency(item.cost)}
        </button>
      )}
    </div>
  );
}

function CRow({ emoji, name, cost, owned, canBuy, onBuy }: { emoji: string; name: string; cost: number; owned: boolean; canBuy: boolean; onBuy: () => void }) {
  return (
    <div className="nm-card p-4 flex items-center gap-3">
      <span className="text-3xl">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm">{name}</p>
      </div>
      {owned ? (
        <span className="text-sm font-bold shrink-0" style={{ color: '#FF6B00' }}>Collected ✓</span>
      ) : (
        <button
          onClick={onBuy}
          disabled={!canBuy}
          className="nm-orange text-white px-4 py-2 rounded-xl text-sm font-bold shrink-0 disabled:opacity-40"
          style={!canBuy ? { background: 'var(--bg-card)', boxShadow: NM_OUT } : undefined}
        >
          {formatCurrency(cost)}
        </button>
      )}
    </div>
  );
}
