# Technical Architecture Document — TycoonX

**Version:** 2.2  
**Date:** 2026-06-16  
**Status:** Active — Admin Management Features added  
**Game Type:** Billionaire Idle Clicker (mobile-first browser SPA)

---

## 1. Overview

TycoonX is a **Billionaire Idle Clicker** web game. Players tap to earn money, buy and upgrade businesses for passive income, invest in stocks / real estate / crypto, and purchase luxury items to grow their fortune. The game is entirely client-side, with a role-based authentication system. The Admin role is protected by a secret key and has full management capabilities over users and feedback.

---

## 2. Architecture

```
Browser (fully client-side)
│
├── React 18 UI (7 route pages + BottomNav)
│        │
│        ▼
├── Zustand Store (gameStore.ts)
│   └── Immer middleware (immutable updates)
│   └── Persist middleware → localStorage key: tycoonx-save
│   └── Auth, Feedback & Admin Management State
│        │
│        ▼
├── Game Data (gameData.ts — static, read-only)
│        │
│        ▼
└── usePassiveIncome hook (setInterval ticks)
```

No backend. Admin access is restricted via a dedicated `AdminLoginPage` and a hardcoded secret key (`admin123`).

---

## 3. Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.3 | UI component framework |
| **TypeScript** | 5.2 | Type safety (strict mode) |
| **Vite** | 5.3 | Build tool, dev server, HMR |
| **Zustand** | 4.5 | Global state management |
| **Immer** | 10.1 | Immutable state updates inside Zustand |
| **Tailwind CSS** | 3.4 | Utility-first CSS |
| **React Router DOM** | 6.23 | Client-side routing (5 tab routes) |
| **Lucide React** | 0.378 | Icon library |
| **Recharts** | 2.12 | Charts (available, used in Profile) |
| **date-fns** | 3.6 | Date utilities (available) |

**Dev tools:**
- Vitest — unit tests
- React Testing Library — component tests
- ESLint — linting

---

## 4. Directory Structure

```
src/
├── App.tsx                      ← BrowserRouter + 5 routes + usePassiveIncome
├── main.tsx                     ← React entry point
│
├── components/
│   └── layout/
│       └── BottomNav.tsx        ← 5-tab nav (Investing/Business/Earnings/Items/Profile)
│
├── data/
│   └── gameData.ts              ← ALL static game data (businesses, stocks, crypto, etc.)
│
├── hooks/
│   └── usePassiveIncome.ts      ← setInterval: income tick/1s, crypto/5s, stocks/30s
│
├── pages/
│   ├── EarningsPage.tsx         ← Credit card + neumorphic tap zone + click upgrades
│   ├── BusinessPage.tsx         ← Buy/upgrade businesses, income overview
│   ├── InvestingPage.tsx        ← 3 sub-tabs: Shares, Real Estate, Cryptocurrency
│   ├── ItemsPage.tsx            ← Vehicles, Residence, Collections
│   ├── ProfilePage.tsx          ← Fortune breakdown, Taxes, Logout, Feedback
│   ├── AuthPage.tsx             ← Player login screen
│   ├── AdminLoginPage.tsx       ← Secure admin login (Secret Key: admin123)
│   └── AdminPage.tsx            ← Management dashboard (Edit/Delete Users & Feedback)
│
├── store/
│   └── gameStore.ts             ← Full Zustand store (state + actions + computed)
│
├── styles/
│   └── globals.css              ← Tailwind directives + neumorphic CSS classes
│
├── types/
│   └── game.types.ts            ← All TypeScript interfaces
│
└── utils/
    └── format.ts                ← ₹ currency formatters (compact + full)
```

**Deleted (old turn-based sim):**
- `src/engine/` (turn.ts, economy.ts, finance.ts) — removed
- `src/components/game/` (DepartmentCard, ProductCard, ProductManager) — removed

---

## 5. Data Layer

### 5.1 Static Game Data (`src/data/gameData.ts`)

All game definitions are static constants. Never mutated at runtime.

| Export | Count | Description |
|---|---|---|
| `BUSINESSES` | 18 | Lemonade Stand → Megacorp. Each: id, name, emoji, baseCost, baseIncomePerHour, maxLevel(40) |
| `STOCKS` | 6 | AD&D, TechGiant, EnergyCorp, PharmaCo, FinanceFirst, RetailKing. Each: basePrice, dividendYieldAnnual, color |
| `PROPERTIES` | 7 | Studio Apt → Private Island. Each: location, cost, rentalIncomePerHour |
| `CRYPTOS` | 6 | BTC, ETH, ADA, XRP, SOL, DOT. Each: basePrice, totalSupply, color |
| `CARS` | 6 | Toyota Corolla → Bugatti Chiron |
| `PLANES` | 6 | Cessna 172 → Airbus A380 |
| `YACHTS` | 6 | Speedboat → Gigayacht |
| `RESIDENCE_TIERS` | 7 | Level 0 (none) → Level 6 (Diamond Palace) |
| `COIN_COLLECTION` | 20 | Rare Coin #1–20 (exponential cost: 100k × 1.8^i) |
| `PAINTING_COLLECTION` | 25 | Masterpiece #1–25 (exponential cost: 500k × 1.6^i) |
| `CLICK_UPGRADES` | 8 | 2× to 500× click multipliers (stacked multiplicatively) |

### 5.2 TypeScript Types (`src/types/game.types.ts`)

```typescript
interface BusinessDef    { id, name, category, emoji, baseCost, baseIncomePerHour, maxLevel }
interface OwnedBusiness  { id, level }
interface StockDef        { id, name, ticker, color, basePrice, dividendYieldAnnual, marketCapBase }
interface StockHolding    { shares, avgBuyPrice }
interface PropertyDef     { id, name, location, cost, rentalIncomePerHour }
interface CryptoDef       { id, name, ticker, color, basePrice, totalSupply }
interface CryptoHolding   { amount, avgBuyPrice }
interface VehicleDef      { id, name, brand, cost, emoji }
interface ResidenceTier   { level, name, cost, netWorthValue, tier: 'bronze'|'silver'|'gold'|'diamond' }
interface CollectionItemDef { id, name, cost, emoji }
interface ClickUpgradeDef { id, name, description, multiplier, cost }
```

---

## 6. State Management (`src/store/gameStore.ts`)

Single Zustand store with Immer + persist middleware.

**Save key:** `tycoonx-save` in localStorage. Auto-saves on every state change.

### 6.1 State Shape

```typescript
interface GameState {
  // Wallet & Identity
  balance: number;
  user: AuthUser | null;
  feedbackList: Feedback[];

  // Assets
  ownedBusinesses:    Record<string, OwnedBusiness>;   // id → { id, level }
  stockHoldings:      Record<string, StockHolding>;    // id → { shares, avgBuyPrice }
  propertyHoldings:   string[];                         // property IDs owned
  cryptoHoldings:     Record<string, CryptoHolding>;   // id → { amount, avgBuyPrice }
  ownedCars:          string[];
  ownedPlanes:        string[];
  ownedYachts:        string[];
  residenceLevel:     number;                           // 0–6
  coinCollection:     boolean[];                        // [20]
  paintingCollection: boolean[];                        // [25]
  purchasedUpgrades:  string[];

  // Live prices (fluctuate via usePassiveIncome)
  cryptoPrices: Record<string, number>;
  stockPrices:  Record<string, number>;
}
```

### 6.2 Actions

| Action | Description |
|---|---|
| `click()` | Adds `getPerClick()` to balance |
| `buyBusiness(id)` | Deduct baseCost, add to ownedBusinesses at level 1 |
| `upgradeBusiness(id)` | Deduct `baseCost × level × 0.5`, increment level |
| `buyStock(id, shares)` | Buy N shares at current price, update avgBuyPrice |
| `sellStock(id, shares)` | Sell N shares at current price |
| `buyProperty(id)` | One-time purchase, add to propertyHoldings |
| `buyCrypto(id, amount)` | Buy N coins at current price |
| `sellCrypto(id, amount)` | Sell N coins at current price |
| `buyCar(id)` | One-time purchase |
| `buyPlane(id)` | One-time purchase |
| `buyYacht(id)` | One-time purchase |
| `upgradeResidence()` | Advance residenceLevel, deduct next tier cost |
| `buyCollectionItem(type, index)` | Purchase coin/painting at index |
| `buyClickUpgrade(id)` | Purchase click multiplier upgrade |
| `tick(deltaSeconds)` | Add `(totalIncomePerHour / 3600) × delta` to balance |
| `updateCryptoPrices()` | Random ±2% price change per coin |
| `updateStockPrices()` | Random ±1% price change per stock |
| `login(username, role)` | Sets user identity and role |
| `logout()` | Clears user identity |
| `submitFeedback(msg)` | Adds feedback entry to `feedbackList` |
| `updateUser(id, name, role)` | Updates a registered user's details |
| `deleteUser(id)` | Removes a user and their data |
| `updateFeedback(id, msg)` | Edits an existing feedback entry |
| `deleteFeedback(id)` | Removes a feedback entry |

### 6.3 Computed Methods (call as functions, always fresh via `get()`)

| Method | Formula |
|---|---|
| `getPerClick()` | `1 × product of all purchased upgrade multipliers` |
| `getBusinessIncomePerHour()` | `Σ (baseIncomePerHour × level)` for owned businesses |
| `getStockIncomePerHour()` | `Σ (shares × price × annualYield / 8760)` |
| `getRentalIncomePerHour()` | `Σ rentalIncomePerHour` for owned properties |
| `getTotalIncomePerHour()` | Sum of above three |
| `getStockPortfolioValue()` | `Σ (shares × currentPrice)` |
| `getCryptoPortfolioValue()` | `Σ (amount × currentPrice)` |
| `getTransportValue()` | Sum of cost for all owned vehicles |
| `getResidenceValue()` | `RESIDENCE_TIERS[residenceLevel].netWorthValue` |
| `getCollectionsValue()` | Sum of cost for all owned collection items |
| `getBusinessesValue()` | `Σ (baseCost × level × 0.5)` for owned businesses |
| `getTotalFortune()` | `balance + all asset values` |

---

## 7. Passive Income System (`src/hooks/usePassiveIncome.ts`)

Called once in `GameApp` (inside the Router). Sets up three intervals:

| Interval | Period | Action |
|---|---|---|
| Income tick | 1 000 ms | `store.tick(1)` — adds 1 second of income to balance |
| Crypto price update | 5 000 ms | `store.updateCryptoPrices()` — ±2% random change |
| Stock price update | 30 000 ms | `store.updateStockPrices()` — ±1% random change |

All intervals cleaned up on component unmount.

---

## 8. Routing (`src/App.tsx`)

Conditional rendering: If `user === null`, the router only allows access to `AuthPage` and `AdminLoginPage` (`/admin-auth`). Otherwise:

**Player (`user.role === 'user'`):**
- Access to: `/`, `/business`, `/investing`, `/items`, `/profile`.
- `BottomNav` is visible.

**Admin (`user.role === 'admin'`):**
- Restricted to `/admin` only.
- `BottomNav` is hidden.
- Automatically redirected to `/admin` from any other path.

---

## 9. UI Design System

### 9.1 Theme

| Token | Value | Usage |
|---|---|---|
| Background | `#1a1a1a` | Page backgrounds, body |
| Surface | `#1e1e1e` | Cards (`.nm-card`, `.nm-out`) |
| Pressed surface | `#161616` | Inset / pressed elements |
| Accent orange | `#FF6B00` | Primary CTA, active states, income numbers |
| Accent orange light | `#FF8C00` | Gradient start for orange buttons |
| Text primary | `#ffffff` | Headings, important numbers |
| Text secondary | `#cccccc` | Body text |
| Text muted | `#888888` | Labels, hints |
| Text disabled | `#444444` | Locked/unavailable states |

### 9.2 Neumorphism CSS Classes (`src/styles/globals.css`)

| Class | Shadow type | Use |
|---|---|---|
| `.nm-out` | Raised outset | Cards, read-only surfaces |
| `.nm-in` | Inset/concave | Input areas, inactive counters, tab containers |
| `.nm-btn` | Raised + `:active` inset | Tappable buttons |
| `.nm-orange` | Orange gradient + glow `:active` | Primary CTA buttons |
| `.nm-card` | Outset with 20px border-radius | Standard card container |

Shadow values:
- **Outset:** `6px 6px 14px #0d0d0d, -5px -5px 12px #2b2b2b`
- **Inset:** `inset 5px 5px 11px #0d0d0d, inset -4px -4px 9px #272727`
- **Orange glow:** `4px 4px 12px rgba(255,107,0,0.5), -2px -2px 6px rgba(255,140,0,0.12)`

### 9.3 Earnings Tap Zone

The tap zone is a large circular neumorphic button (210×210px). State-driven shadow toggle:
- **Idle:** `inset 12px 12px 26px #0c0c0c, inset -10px -10px 20px #282828` (concave)
- **Tapped (150ms):** `8px 8px 18px #0d0d0d, -6px -6px 16px #272727, 0 0 40px rgba(255,107,0,0.35)` (convex + orange glow)

### 9.4 Currency Formatting (`src/utils/format.ts`)

| Function | Output example | Used for |
|---|---|---|
| `formatCurrency(value)` | `₹ 4.7k` / `₹ 148.8 B` / `₹ 570.2 T` | All in-game amounts |
| `formatCurrencyFull(value)` | `₹ 79,847,955,826,599.90` | Credit card balance (Earnings page) |

Locale: `en-IN` (Indian Rupee formatting).

---

## 10. Screen Reference

### Auth
- **Player Login**: Minimalist screen for users to enter a username.
- **Admin Login (`/admin-auth`)**: Secure "Control Panel" requiring username and Secret Key (`admin123`).

### Admin
- **User Management**: Inline editing (username/role) and deletion of all registered users.
- **Feedback Moderation**: Inline editing and deletion of user feedback entries.
- **System Metrics**: Overview of total registered users and feedback counts.
- **Logout**: Direct button to end admin session.

### Earnings
- Top: dark header with energy indicator
- Credit card: `.nm-card`, Mastercard circles (orange), full balance via `formatCurrencyFull`
- Per-click pill: `.nm-in` inset box
- Tap zone: large circular neumorphic button (concave ↔ convex animation)
- Click upgrades: `.nm-btn` list, shows next 3 available upgrades

### Business
- Income card: `.nm-card` with orange total income/hr
- "Start a business" → bottom sheet modal listing all unowned businesses
- Company list: `.nm-card` per business, orange level progress bar, upgrade button

### Investing
- Tab switcher: `.nm-in` pill container, orange gradient active tab
- **Shares tab:** Portfolio card, "Stock market" orange button → modal, stable income list
- **Real Estate tab:** Rental income inset display, market/property cards → modal
- **Crypto tab:** Total value card (orange left border), live coin list with trend arrows → buy modal

### Items
- Gallery tiles: `.nm-btn` with emoji + owned count badge
- Shop tiles: `.nm-btn` with orange label → bottom sheet shop
- Residence: `.nm-out` card + orange progress bar + upgrade button
- Collections: `.nm-btn` tiles → bottom sheet (Coins 20 items, Paintings 25 items)

### Profile
- Fortune total: white text with `textShadow: 0 0 30px rgba(255,107,0,0.4)`
- Fortune bar: proportional colored segments (glowing per category)
- Category grid: 2×4 `.nm-card` grid with color dot per category
- Taxes: `.nm-out` card
- **User Info**: Displays current username and role.
- **Logout**: Button to clear the user session.
- **Feedback**: Form for users to submit suggestions or report bugs.

### Bottom Nav
- Background: `#1a1a1a`, upward neumorphic shadow
- Active tab: `#FF6B00` icon + text + orange dot indicator
- Earnings center: raised orange gradient circle, glow when active

---

## 11. Build & Dev

```bash
npm run dev       # Vite dev server → http://localhost:5173
npm run build     # TypeScript check + Vite production build → dist/
npm run preview   # Serve dist/ locally
npm run test      # Vitest test runner
```

No backend. No environment variables needed. Open `localhost:5173` in browser to play.

---

## 12. Known Limitations / Future Work

| Item | Notes |
|---|---|
| Business mergers | UI button exists, logic not implemented |
| Taxes mechanic | Card shown on Profile, logic not implemented |
| No Ads feature | Banner shown, no actual ad system |
| Stock/crypto sell UI | Store actions exist, sell UI not exposed yet |
| Sell stock/crypto | `sellStock()` and `sellCrypto()` in store, no UI button |
| Sound effects | Not implemented |
| Animations | Basic CSS transitions only; no particle effects |
| Offline earnings | Not calculated on app re-open (could add on mount) |
| Save slots | UI shows 3 slot icons, only 1 auto-save slot implemented |

---

*TycoonX Technical Document v2.1 — 2026-06-16*
