export interface BusinessDef {
  id: string;
  name: string;
  category: string;
  emoji: string;
  baseCost: number;
  baseIncomePerHour: number;
  maxLevel: number;
}

export interface OwnedBusiness {
  id: string;
  level: number;
  mergeBonus?: number;  // income multiplier from mergers, starts at 1
  mergeCount?: number;  // times this business has absorbed others, max 3
}

export interface StockDef {
  id: string;
  name: string;
  ticker: string;
  color: string;
  basePrice: number;
  dividendYieldAnnual: number;
  marketCapBase: number;
}

export interface StockHolding {
  shares: number;
  avgBuyPrice: number;
}

export interface PropertyDef {
  id: string;
  name: string;
  location: string;
  cost: number;
  rentalIncomePerHour: number;
}

export interface CryptoDef {
  id: string;
  name: string;
  ticker: string;
  color: string;
  basePrice: number;
  totalSupply: number;
}

export interface CryptoHolding {
  amount: number;
  avgBuyPrice: number;
}

export interface VehicleDef {
  id: string;
  name: string;
  brand: string;
  cost: number;
  emoji: string;
}

export interface ResidenceTier {
  level: number;
  name: string;
  cost: number;
  netWorthValue: number;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
}

export interface CollectionItemDef {
  id: string;
  name: string;
  cost: number;
  emoji: string;
}

export interface ClickUpgradeDef {
  id: string;
  name: string;
  description: string;
  clickValue: number;
  cost: number;
}

export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
}

export interface Feedback {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
  reply?: string;
  repliedAt?: number;
}
