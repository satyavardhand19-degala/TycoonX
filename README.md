# 🏢 TycoonX

> Build your dynasty. Dominate the market. Rule the world.

**TycoonX** is a browser-based business simulation game where players start as a small entrepreneur and grow their company into a global corporate empire. Make strategic decisions, manage resources, invest wisely, and outcompete rivals to become the ultimate tycoon.

---

## 🎮 Game Overview

TycoonX puts you in the seat of a CEO building a company from scratch. Start with a small storefront and a limited budget — then expand into new industries, hire employees, research technologies, and acquire competitors. Every decision has consequences. Every dollar counts.

---

## ✨ Features

- **Company Management** — Hire staff, set salaries, manage departments (R&D, Marketing, Operations, Finance)
- **Market Economy** — Dynamic supply & demand simulation; prices fluctuate based on player and AI actions
- **Multiple Industries** — Tech, Retail, Real Estate, Finance, Manufacturing, Media, and more
- **Role-based Authentication** — Separate login flows for Players and Admins
- **User Feedback System** — Direct communication channel for players
- **Admin Control Panel** — Secure dashboard for managing users and moderating feedback
- **Stock Market** — List your company, issue shares, trade stocks, and execute hostile takeovers
- **Research & Innovation** — Unlock new products, efficiencies, and market advantages via a tech tree
- **Global Expansion** — Enter new regional markets, each with unique challenges and opportunities
- **Events System** — Economic recessions, booms, scandals, and geopolitical events shape the game world
- **Achievements & Leaderboards** — Track milestones and compete with other players globally

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourorg/tycoonx.git
cd tycoonx

# Install dependencies
npm install

# Start development server
npm run dev

# Open your browser at
http://localhost:5173
```

---

## 🗂️ Project Structure

```
tycoonx/
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Game screens (Earnings, Business, Admin, etc.)
│   ├── engine/           # Core game logic (economy, finance, turn)
│   │   ├── economy.ts    # Market simulation
│   │   ├── finance.ts    # Financial reporting
│   │   └── turn.ts       # Turn orchestrator
│   ├── store/            # Zustand state management
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helpers and calculators
│   ├── types/            # TypeScript definitions
│   └── styles/           # Tailwind CSS and global styles
├── tests/                # Unit and integration tests
├── scope.md              # Project scope
├── specification.md      # Game specification
├── tech.doc.md           # Technical architecture
└── package.json          # Dependencies and scripts
```

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS |
| State | Zustand + Immer |
| Build | Vite |
| Icons | Lucide React |
| Testing | Vitest + React Testing Library |

---

## 🎯 Target Audience

- Fans of business simulation games (e.g., Capitalism Lab, Game Dev Tycoon, SimCity)
- Casual-to-mid-core web gamers aged 16–40
- Strategy and economics enthusiasts

---

## 📜 License

MIT License © 2026 TycoonX Team

---

## 🤝 Contributing

We welcome contributions! Please read `CONTRIBUTING.md` before submitting a pull request. Join our Discord for design discussions and playtesting.

---

## 📬 Contact

- **Email:** satyavardhand19@gmail.com
