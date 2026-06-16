# 📐 Game Specification — TycoonX

**Version:** 2.1  
**Date:** June 2026  
**Status:** Updated for Admin Management Features

---

## 1. Overview

TycoonX is a billionaire idle clicker game where players progress from humble beginnings to becoming the world's wealthiest tycoon. The core gameplay revolves around manual clicking (tapping) to earn initial capital, purchasing and upgrading businesses for passive income, and strategically investing in volatile markets.

---

## 2. Game Structure

### 2.1 Core Loop

```
Manual Clicking → Earn Cash → Buy/Upgrade Businesses → Generate Passive Income
      ↑                                                      ↓
      └─────────────────── Reinvest Profits ──────────────────┘
                              ↓
                      Strategic Investing
                (Stocks, Real Estate, Crypto)
                              ↓
                      Purchase Luxuries
                 (Cars, Planes, Yachts, Art)
```

### 2.2 Win Conditions

- **Total Fortune Milestone**: Reach a net worth of ₹1 Quadrillion.
- **Empire Builder**: Fully upgrade all 18 businesses to their maximum level.
- **Master Collector**: Complete both the Coin and Painting collections.

---

## 3. Core Systems

### 3.1 Authentication & Roles

TycoonX features a role-based access system. Player and Admin logins are separated for privacy and security.

| Role | Access | Description |
|---|---|---|
| **User** | Player Login | Can play the game, save progress, and submit feedback. |
| **Admin** | Admin Login (`/admin-auth`) | Access to the Control Panel. Manage users and feedback. Restricted from standard game play. |

### 3.2 Earnings (Clicking)

- **Manual Tap**: Each click on the central neumorphic button generates cash.
- **Click Upgrades**: Players can purchase multipliers that stack to significantly increase earnings per click.

### 3.3 Business Management

Players can own up to 18 different businesses, ranging from a Lemonade Stand to a Global Megacorp.
- **Upgrades**: Businesses can be upgraded up to Level 40, increasing their passive income per hour.
- **Income Scaling**: Business income scales exponentially with levels.

### 3.4 Investing

- **Stocks**: Buy shares in stable corporations that pay hourly dividends. Prices fluctuate every 30 seconds.
- **Real Estate**: Purchase properties for consistent rental income.
- **Cryptocurrency**: High-risk, high-reward assets with prices fluctuating every 5 seconds.

### 3.5 Items & Luxuries

- **Transport**: Purchase luxury cars, private planes, and superyachts.
- **Residence**: Upgrade your primary residence through 6 tiers, from a basic apartment to a Diamond Palace.
- **Collections**: Find and purchase 20 rare coins and 25 masterpieces to boost your total fortune.

### 3.6 Tax System

As a player's fortune grows, they enter higher tax brackets (0% to 30%).
- **Tax Due**: A portion of passive income is set aside as tax due.
- **Penalties**: Failing to pay taxes on time results in a 25% overdue penalty.

---

## 4. Administrative Management System

The Admin Dashboard (Control Panel) provides tools for managing the game community:
- **User Management**: Admins can view a list of all registered users, edit their usernames/roles, or delete accounts.
- **Feedback Moderation**: Admins can review all submitted feedback, edit messages for clarity, or delete entries.
- **Secure Access**: The Admin Login page is separate from the player login and is protected by a Secret Key (`admin123`).

---

## 5. UI Layout

- **Investing**: Manage stocks, real estate, and crypto.
- **Business**: Buy and upgrade passive income sources.
- **Earnings**: The central hub for manual clicking and balance overview.
- **Items**: Purchase vehicles, residences, and collection items.
- **Profile**: Detailed fortune breakdown, tax management, and feedback submission.
- **Admin (Control Panel)**: Exclusive access for admins to manage users and feedback.

---

*Specification v2.1 — Updated June 2026*
