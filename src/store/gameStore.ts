import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import {
  BUSINESSES, STOCKS, CRYPTOS, PROPERTIES,
  CARS, PLANES, YACHTS, RESIDENCE_TIERS,
  COIN_COLLECTION, PAINTING_COLLECTION, CLICK_UPGRADES
} from '../data/gameData';
import type { OwnedBusiness, StockHolding, CryptoHolding, AuthUser, Feedback, UserRole } from '../types/game.types';

interface GameState {
  balance: number;
  user: AuthUser | null;
  registeredUsers: AuthUser[];
  feedbackList: Feedback[];

  ownedBusinesses: Record<string, OwnedBusiness>;
  stockHoldings: Record<string, StockHolding>;
  propertyHoldings: string[];
  propertyLevels: Record<string, number>;
  cryptoHoldings: Record<string, CryptoHolding>;

  ownedCars: string[];
  ownedPlanes: string[];
  ownedYachts: string[];

  residenceLevel: number;
  coinCollection: boolean[];
  paintingCollection: boolean[];

  purchasedUpgrades: string[];

  cryptoPrices: Record<string, number>;
  stockPrices: Record<string, number>;

  taxDue: number;
  totalTaxPaid: number;
  lastSeenAt: number;
  soundEnabled: boolean;

  // Actions
  click: () => void;
  buyBusiness: (id: string) => void;
  upgradeBusiness: (id: string) => void;
  buyStock: (id: string, shares: number) => void;
  sellStock: (id: string, shares: number) => void;
  buyProperty: (id: string) => void;
  upgradeProperty: (id: string) => void;
  buyCrypto: (id: string, amount: number) => void;
  sellCrypto: (id: string, amount: number) => void;
  buyCar: (id: string) => void;
  buyPlane: (id: string) => void;
  buyYacht: (id: string) => void;
  upgradeResidence: () => void;
  buyCollectionItem: (type: 'coin' | 'painting', index: number) => void;
  buyClickUpgrade: (id: string) => void;
  tick: (deltaSeconds: number) => void;
  updateCryptoPrices: () => void;
  updateStockPrices: () => void;
  payTaxes: () => void;
  mergeBusiness: (absorbedId: string, survivorId: string) => void;
  saveSlot: (slot: number) => void;
  loadSlot: (slot: number) => void;
  applyOfflineEarnings: (seconds: number) => number;
  toggleSound: () => void;

  login: (username: string, role: UserRole, password?: string) => string | null;
  logout: () => void;
  submitFeedback: (message: string) => void;
  updateUser: (id: string, username: string, role: UserRole, password?: string) => void;
  deleteUser: (id: string) => void;
  updateFeedback: (id: string, message: string) => void;
  deleteFeedback: (id: string) => void;

  // Computed helpers
  getPerClick: () => number;
  getTaxRate: () => number;
  getTaxPenalty: () => number;
  getTotalIncomePerHour: () => number;
  getTotalFortune: () => number;
  getBusinessIncomePerHour: () => number;
  getStockIncomePerHour: () => number;
  getRentalIncomePerHour: () => number;
  getStockPortfolioValue: () => number;
  getCryptoPortfolioValue: () => number;
  getTransportValue: () => number;
  getResidenceValue: () => number;
  getCollectionsValue: () => number;
  getBusinessesValue: () => number;
}

const initialCryptoPrices = Object.fromEntries(CRYPTOS.map(c => [c.id, c.basePrice]));
const initialStockPrices   = Object.fromEntries(STOCKS.map(s => [s.id, s.basePrice]));

export const useGameStore = create<GameState>()(
  persist(
    immer((set, get) => ({
      balance: 0,
      user: null,
      registeredUsers: [],
      feedbackList: [],
      ownedBusinesses: {},
      stockHoldings: {},
      propertyHoldings: [],
      propertyLevels: {},
      cryptoHoldings: {},
      ownedCars: [],
      ownedPlanes: [],
      ownedYachts: [],
      residenceLevel: 0,
      coinCollection: Array(20).fill(false),
      paintingCollection: Array(25).fill(false),
      purchasedUpgrades: [],
      cryptoPrices: initialCryptoPrices,
      stockPrices: initialStockPrices,
      taxDue: 0,
      totalTaxPaid: 0,
      lastSeenAt: Date.now(),
      soundEnabled: true,

      click: () => set(state => {
        state.balance += get().getPerClick();
      }),

      buyBusiness: (id) => set(state => {
        const def = BUSINESSES.find(b => b.id === id);
        if (!def || state.balance < def.baseCost) return;
        state.balance -= def.baseCost;
        state.ownedBusinesses[id] = { id, level: 1 };
      }),

      upgradeBusiness: (id) => set(state => {
        const def = BUSINESSES.find(b => b.id === id);
        const owned = state.ownedBusinesses[id];
        if (!def || !owned || owned.level >= def.maxLevel) return;
        const upgradeCost = def.baseCost * owned.level * 0.5;
        if (state.balance < upgradeCost) return;
        state.balance -= upgradeCost;
        owned.level += 1;
      }),

      buyStock: (id, shares) => set(state => {
        const price = state.stockPrices[id];
        const totalCost = price * shares;
        if (state.balance < totalCost || shares <= 0) return;
        state.balance -= totalCost;
        if (state.stockHoldings[id]) {
          const existing = state.stockHoldings[id];
          const totalShares = existing.shares + shares;
          existing.avgBuyPrice = (existing.avgBuyPrice * existing.shares + price * shares) / totalShares;
          existing.shares = totalShares;
        } else {
          state.stockHoldings[id] = { shares, avgBuyPrice: price };
        }
      }),

      sellStock: (id, shares) => set(state => {
        const holding = state.stockHoldings[id];
        if (!holding || shares > holding.shares) return;
        state.balance += state.stockPrices[id] * shares;
        holding.shares -= shares;
        if (holding.shares === 0) delete state.stockHoldings[id];
      }),

      buyProperty: (id) => set(state => {
        const def = PROPERTIES.find(p => p.id === id);
        if (!def || state.balance < def.cost || state.propertyHoldings.includes(id)) return;
        state.balance -= def.cost;
        state.propertyHoldings.push(id);
        state.propertyLevels[id] = 1;
      }),

      upgradeProperty: (id) => set(state => {
        const def = PROPERTIES.find(p => p.id === id);
        if (!def || !state.propertyHoldings.includes(id)) return;
        const level = state.propertyLevels[id] ?? 1;
        if (level >= 10) return;
        const cost = def.cost * 0.5 * level;
        if (state.balance < cost) return;
        state.balance -= cost;
        state.propertyLevels[id] = level + 1;
      }),

      buyCrypto: (id, amount) => set(state => {
        const price = state.cryptoPrices[id];
        const totalCost = price * amount;
        if (state.balance < totalCost || amount <= 0) return;
        state.balance -= totalCost;
        if (state.cryptoHoldings[id]) {
          const existing = state.cryptoHoldings[id];
          const totalAmount = existing.amount + amount;
          existing.avgBuyPrice = (existing.avgBuyPrice * existing.amount + price * amount) / totalAmount;
          existing.amount = totalAmount;
        } else {
          state.cryptoHoldings[id] = { amount, avgBuyPrice: price };
        }
      }),

      sellCrypto: (id, amount) => set(state => {
        const holding = state.cryptoHoldings[id];
        if (!holding || amount > holding.amount) return;
        state.balance += state.cryptoPrices[id] * amount;
        holding.amount -= amount;
        if (holding.amount <= 0) delete state.cryptoHoldings[id];
      }),

      buyCar: (id) => set(state => {
        const def = CARS.find(c => c.id === id);
        if (!def || state.balance < def.cost || state.ownedCars.includes(id)) return;
        state.balance -= def.cost;
        state.ownedCars.push(id);
      }),

      buyPlane: (id) => set(state => {
        const def = PLANES.find(p => p.id === id);
        if (!def || state.balance < def.cost || state.ownedPlanes.includes(id)) return;
        state.balance -= def.cost;
        state.ownedPlanes.push(id);
      }),

      buyYacht: (id) => set(state => {
        const def = YACHTS.find(y => y.id === id);
        if (!def || state.balance < def.cost || state.ownedYachts.includes(id)) return;
        state.balance -= def.cost;
        state.ownedYachts.push(id);
      }),

      upgradeResidence: () => set(state => {
        const nextLevel = state.residenceLevel + 1;
        const tier = RESIDENCE_TIERS[nextLevel];
        if (!tier || state.balance < tier.cost) return;
        state.balance -= tier.cost;
        state.residenceLevel = nextLevel;
      }),

      buyCollectionItem: (type, index) => set(state => {
        const items = type === 'coin' ? COIN_COLLECTION : PAINTING_COLLECTION;
        const collection = type === 'coin' ? state.coinCollection : state.paintingCollection;
        const item = items[index];
        if (!item || collection[index] || state.balance < item.cost) return;
        state.balance -= item.cost;
        collection[index] = true;
      }),

      buyClickUpgrade: (id) => set(state => {
        const upgrade = CLICK_UPGRADES.find(u => u.id === id);
        if (!upgrade || state.balance < upgrade.cost || state.purchasedUpgrades.includes(id)) return;
        state.balance -= upgrade.cost;
        state.purchasedUpgrades.push(id);
      }),

      tick: (deltaSeconds) => set(state => {
        const incomePerHour = get().getTotalIncomePerHour();
        const earned = (incomePerHour / 3600) * deltaSeconds;
        state.balance += earned;
        const taxRate = get().getTaxRate();
        if (taxRate > 0) state.taxDue += earned * taxRate;
        state.lastSeenAt = Date.now();
      }),

      saveSlot: (slot) => {
        const s = get();
        localStorage.setItem(`tycoonx-slot-${slot}`, JSON.stringify({
          savedAt: Date.now(),
          fortune: s.getTotalFortune(),
          gameState: {
            balance: s.balance,
            ownedBusinesses: s.ownedBusinesses,
            stockHoldings: s.stockHoldings,
            propertyHoldings: s.propertyHoldings,
            cryptoHoldings: s.cryptoHoldings,
            ownedCars: s.ownedCars,
            ownedPlanes: s.ownedPlanes,
            ownedYachts: s.ownedYachts,
            residenceLevel: s.residenceLevel,
            coinCollection: s.coinCollection,
            paintingCollection: s.paintingCollection,
            purchasedUpgrades: s.purchasedUpgrades,
            cryptoPrices: s.cryptoPrices,
            stockPrices: s.stockPrices,
            taxDue: s.taxDue,
            totalTaxPaid: s.totalTaxPaid,
          },
        }));
      },

      loadSlot: (slot) => {
        const raw = localStorage.getItem(`tycoonx-slot-${slot}`);
        if (!raw) return;
        try {
          const { gameState: gs } = JSON.parse(raw);
          set(state => {
            state.balance          = gs.balance;
            state.ownedBusinesses  = gs.ownedBusinesses;
            state.stockHoldings    = gs.stockHoldings;
            state.propertyHoldings = gs.propertyHoldings;
            state.cryptoHoldings   = gs.cryptoHoldings;
            state.ownedCars        = gs.ownedCars;
            state.ownedPlanes      = gs.ownedPlanes;
            state.ownedYachts      = gs.ownedYachts;
            state.residenceLevel   = gs.residenceLevel;
            state.coinCollection   = gs.coinCollection;
            state.paintingCollection = gs.paintingCollection;
            state.purchasedUpgrades  = gs.purchasedUpgrades;
            state.cryptoPrices     = gs.cryptoPrices;
            state.stockPrices      = gs.stockPrices;
            state.taxDue           = gs.taxDue      ?? 0;
            state.totalTaxPaid     = gs.totalTaxPaid ?? 0;
          });
        } catch {}
      },

      toggleSound: () => set(state => { state.soundEnabled = !state.soundEnabled; }),

      login: (username, role, password) => {
        let error = null;
        set(state => {
          const existing = state.registeredUsers.find(u => u.username === username);
          
          if (existing) {
            // Check password for existing user
            if (password && existing.password && existing.password !== password) {
              error = 'Incorrect password for this username.';
              return;
            }
            state.user = existing;
          } else {
            // Register new user
            const newUser = { 
              id: Math.random().toString(36).substring(7), 
              username, 
              password,
              role 
            };
            state.user = newUser;
            state.registeredUsers.push(newUser);
          }
        });
        return error;
      },

      logout: () => set(state => {
        state.user = null;
      }),

      submitFeedback: (message) => set(state => {
        if (!state.user) return;
        state.feedbackList.push({
          id: Math.random().toString(36).substring(7),
          userId: state.user.id,
          username: state.user.username,
          message,
          timestamp: Date.now(),
        });
      }),

      updateUser: (id, username, role, password) => set(state => {
        const u = state.registeredUsers.find(user => user.id === id);
        if (u) {
          u.username = username;
          u.role = role;
          if (password) u.password = password;
          // If the currently logged in user is being updated, update their state too
          if (state.user?.id === id) {
            state.user.username = username;
            state.user.role = role;
            if (password) state.user.password = password;
          }
        }
      }),

      deleteUser: (id) => set(state => {
        state.registeredUsers = state.registeredUsers.filter(u => u.id !== id);
        if (state.user?.id === id) state.user = null;
      }),

      updateFeedback: (id, message) => set(state => {
        const f = state.feedbackList.find(fb => fb.id === id);
        if (f) f.message = message;
      }),

      deleteFeedback: (id) => set(state => {
        state.feedbackList = state.feedbackList.filter(f => f.id !== id);
      }),

      applyOfflineEarnings: (seconds) => {
        const incomePerHour = get().getTotalIncomePerHour();
        const earned = (incomePerHour / 3600) * seconds;
        if (earned <= 0) return 0;
        const taxRate = get().getTaxRate();
        set(state => {
          state.balance    += earned;
          if (taxRate > 0) state.taxDue += earned * taxRate;
          state.lastSeenAt  = Date.now();
        });
        return earned;
      },

      mergeBusiness: (absorbedId, survivorId) => set(state => {
        const absorbed = state.ownedBusinesses[absorbedId];
        const survivor = state.ownedBusinesses[survivorId];
        if (!absorbed || !survivor || absorbedId === survivorId) return;
        if ((survivor.mergeCount ?? 0) >= 3) return;
        survivor.level      = Math.max(absorbed.level, survivor.level);
        survivor.mergeBonus = (survivor.mergeBonus ?? 1) + 0.5;
        survivor.mergeCount = (survivor.mergeCount ?? 0) + 1;
        delete state.ownedBusinesses[absorbedId];
      }),

      payTaxes: () => set(state => {
        if (state.taxDue <= 0) return;
        const penalty = get().getTaxPenalty();
        const totalDue = state.taxDue * (1 + penalty);
        if (state.balance < totalDue) return;
        state.balance -= totalDue;
        state.totalTaxPaid += totalDue;
        state.taxDue = 0;
      }),

      updateCryptoPrices: () => set(state => {
        CRYPTOS.forEach(coin => {
          const current = state.cryptoPrices[coin.id];
          const changePercent = (Math.random() - 0.5) * 0.04; // ±2%
          state.cryptoPrices[coin.id] = Math.max(current * (1 + changePercent), coin.basePrice * 0.01);
        });
      }),

      updateStockPrices: () => set(state => {
        STOCKS.forEach(stock => {
          const current = state.stockPrices[stock.id];
          const changePercent = (Math.random() - 0.5) * 0.02; // ±1%
          state.stockPrices[stock.id] = Math.max(current * (1 + changePercent), stock.basePrice * 0.1);
        });
      }),

      getPerClick: () => {
        const { purchasedUpgrades } = get();
        return CLICK_UPGRADES
          .filter(u => purchasedUpgrades.includes(u.id))
          .reduce((acc, u) => acc * u.multiplier, 1);
      },

      getBusinessIncomePerHour: () => {
        const { ownedBusinesses } = get();
        return BUSINESSES.reduce((total, def) => {
          const owned = ownedBusinesses[def.id];
          if (!owned) return total;
          return total + def.baseIncomePerHour * owned.level * (owned.mergeBonus ?? 1);
        }, 0);
      },

      getStockIncomePerHour: () => {
        const { stockHoldings, stockPrices } = get();
        return STOCKS.reduce((total, def) => {
          const holding = stockHoldings[def.id];
          if (!holding) return total;
          const value = holding.shares * stockPrices[def.id];
          return total + (value * def.dividendYieldAnnual) / 8760;
        }, 0);
      },

      getRentalIncomePerHour: () => {
        const { propertyHoldings, propertyLevels } = get();
        return PROPERTIES.reduce((total, def) => {
          if (!propertyHoldings.includes(def.id)) return total;
          const level = propertyLevels[def.id] ?? 1;
          return total + def.rentalIncomePerHour * level;
        }, 0);
      },

      getTotalIncomePerHour: () => {
        return get().getBusinessIncomePerHour() + get().getStockIncomePerHour() + get().getRentalIncomePerHour();
      },

      getStockPortfolioValue: () => {
        const { stockHoldings, stockPrices } = get();
        return STOCKS.reduce((total, def) => {
          const holding = stockHoldings[def.id];
          return holding ? total + holding.shares * stockPrices[def.id] : total;
        }, 0);
      },

      getCryptoPortfolioValue: () => {
        const { cryptoHoldings, cryptoPrices } = get();
        return CRYPTOS.reduce((total, def) => {
          const holding = cryptoHoldings[def.id];
          return holding ? total + holding.amount * cryptoPrices[def.id] : total;
        }, 0);
      },

      getTransportValue: () => {
        const { ownedCars, ownedPlanes, ownedYachts } = get();
        const carVal   = CARS.filter(c => ownedCars.includes(c.id)).reduce((s, c) => s + c.cost, 0);
        const planeVal = PLANES.filter(p => ownedPlanes.includes(p.id)).reduce((s, p) => s + p.cost, 0);
        const yachtVal = YACHTS.filter(y => ownedYachts.includes(y.id)).reduce((s, y) => s + y.cost, 0);
        return carVal + planeVal + yachtVal;
      },

      getResidenceValue: () => {
        return RESIDENCE_TIERS[get().residenceLevel]?.netWorthValue ?? 0;
      },

      getCollectionsValue: () => {
        const { coinCollection, paintingCollection } = get();
        const coinVal = COIN_COLLECTION.reduce((s, item, i) => s + (coinCollection[i] ? item.cost : 0), 0);
        const paintVal = PAINTING_COLLECTION.reduce((s, item, i) => s + (paintingCollection[i] ? item.cost : 0), 0);
        return coinVal + paintVal;
      },

      getBusinessesValue: () => {
        const { ownedBusinesses } = get();
        return BUSINESSES.reduce((total, def) => {
          const owned = ownedBusinesses[def.id];
          return owned ? total + def.baseCost * owned.level * 0.5 : total;
        }, 0);
      },

      getTaxRate: () => {
        const fortune = get().getTotalFortune();
        if (fortune < 1e7)  return 0;     // < ₹1 Cr — exempt
        if (fortune < 1e9)  return 0.10;  // ₹1Cr–₹100Cr
        if (fortune < 1e11) return 0.20;  // ₹100Cr–₹10,000Cr
        return 0.30;                       // > ₹10,000Cr
      },

      getTaxPenalty: () => {
        const { taxDue } = get();
        const incomePerHour = get().getTotalIncomePerHour();
        const taxRate = get().getTaxRate();
        if (taxDue <= 0 || incomePerHour <= 0 || taxRate <= 0) return 0;
        // penalty if tax due exceeds 8 hours of taxable income
        const taxablePerHour = incomePerHour * taxRate;
        return taxDue > taxablePerHour * 8 ? 0.25 : 0;
      },

      getTotalFortune: () => {
        const s = get();
        return s.balance + s.getBusinessesValue() + s.getStockPortfolioValue() +
          s.getCryptoPortfolioValue() + s.getTransportValue() +
          s.getResidenceValue() + s.getCollectionsValue() +
          PROPERTIES.reduce((t, def) => s.propertyHoldings.includes(def.id) ? t + def.cost * 0.8 : t, 0);
      },
    })),
    {
      name: 'tycoonx-save',
      version: 5,
      migrate: (old: unknown, _v: number) => {
        const s = (old ?? {}) as Record<string, unknown>;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { stockPrices: _sp, cryptoPrices: _cp, ...rest } = s;
        return rest;
      },
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { stockPrices, cryptoPrices, ...rest } = state;
        return rest;
      },
    }
  )
);
