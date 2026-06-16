# 📋 Project Scope — TycoonX

**Version:** 1.0  
**Date:** May 2026  
**Status:** Active Development  
**Owner:** TycoonX Team

---

## 1. Project Purpose

TycoonX is a web-based business simulation game designed to provide an engaging, strategic experience where players build a company from startup to global corporation. The project aims to deliver a polished, playable MVP within a defined timeline, with a clear path to post-launch feature expansion.

---

## 2. In Scope

### 2.1 Core Gameplay (MVP — Phase 1)

| Feature | Description | Status |
|---|---|---|
| Company Creation | Player names company, chooses starting industry, receives seed capital | ✅ Done |
| Dashboard | Real-time overview of finances, employees, market share, and reputation | ✅ Done (Basic) |
| Department Management | Hire/fire staff across R&D, Marketing, Sales, Operations, Finance | ⏳ In Progress |
| Product Development | Create, price, and launch products within the chosen industry | ⏳ In Progress |
| Basic Market Simulation | Supply/demand engine influencing product prices and sales volume | ✅ Done (Logic) |
| Financials | Income statement, balance sheet, cash flow tracking | ✅ Done (Logic) |
| Turn-Based Time System | Advance by week/month; events trigger on each turn | ✅ Done |
| AI Competitors (3 rivals) | Rule-based AI companies that compete in the same market | ⏳ Pending |
| Save/Load System | Browser localStorage save; 3 save slots | ✅ Done |
| Authentication | Role-based login (User/Admin) with session persistence | ✅ Done |
| Feedback System | Integrated feedback form and Admin moderation tools | ✅ Done |
| Admin Control Panel | Secure access with user/feedback editing and deletion | ✅ Done |
| Win/Lose Conditions | Win = net worth target; Lose = bankruptcy | ⏳ Pending |

### 2.2 Extended Features (Phase 2 — Post-Launch)

- Stock Market and IPO mechanics
- Global regional markets (North America, Europe, Asia, Emerging Markets)
- Tech research tree with unlockable innovations
- Corporate espionage and sabotage mechanics
- Hostile takeovers and M&A
- Online leaderboard with persistent user accounts
- Achievements and badge system
- Dynamic news/events feed affecting economy

### 2.3 Platform & Compatibility

- **Target platforms:** Desktop web browsers (Chrome, Firefox, Safari, Edge)
- **Mobile:** Responsive layout for tablet; mobile support in Phase 2
- **Offline support:** Core gameplay runs fully offline via localStorage
- **Accessibility:** WCAG 2.1 AA compliance for Phase 1

---

## 3. Out of Scope

The following items are explicitly **not** included in any planned release unless re-scoped:

- Native mobile app (iOS / Android)
- Real-money transactions or gambling mechanics
- Multiplayer real-time gameplay (co-op or PvP)
- 3D graphics or game engine (Unity, Unreal)
- Voice or audio narration
- Full localization (only English in Phase 1; i18n framework set up for future)
- User-generated content or modding support
- Integration with real financial markets or APIs (e.g. live stock prices)
- Social media auto-posting features

---

## 4. Assumptions

- The game will be a single-page application (SPA) hosted on a static CDN.
- Server-side infrastructure is only required for leaderboards (Phase 2) — Phase 1 is fully client-side.
- Players do not need an account to play; accounts are optional for leaderboard participation.
- The AI simulation does not require a separate server; all logic runs in-browser.
- Game balance will be iterated post-launch based on player feedback.

---

## 5. Constraints

| Constraint | Detail |
|---|---|
| Timeline | Phase 1 MVP in 12 weeks from kickoff |
| Team Size | 3–5 developers (frontend-heavy) |
| Budget | Open source; no paid third-party game engines |
| Browser Performance | Game logic must run at 60 FPS with no UI jank on mid-range hardware |
| Bundle Size | Initial JS bundle < 500KB gzipped |

---

## 6. Dependencies

- **React 18** — UI framework
- **Zustand** — Lightweight state management
- **Vite** — Build tooling
- **Tailwind CSS** — Utility-first styling
- **Chart.js / Recharts** — Financial charts and graphs
- **Vitest** — Testing framework
- **Node.js + Express** — Backend (Phase 2 only, for leaderboards)
- **PostgreSQL** — User account persistence (Phase 2 only)

---

## 7. Milestones

| Milestone | Target Date | Description |
|---|---|---|
| M0 — Project Setup | Week 1 | Repo, CI/CD, design system scaffold |
| M1 — Core Engine | Week 4 | Economy simulation, turn system, financials |
| M2 — Gameplay Loop | Week 7 | All Phase 1 features playable end-to-end |
| M3 — Polish & QA | Week 10 | UI polish, bug fixing, balance pass |
| M4 — MVP Launch | Week 12 | Public release of Phase 1 |
| M5 — Phase 2 Start | Week 16 | Stock market, leaderboards, global markets |

---

## 8. Success Criteria

- MVP is playable from start to win/lose state with no blocking bugs
- Average session length ≥ 20 minutes (measured via analytics)
- < 2-second initial load time on a 10 Mbps connection
- Positive user feedback score ≥ 4.0/5.0 in post-launch survey
- ≥ 80% unit test coverage on core game engine modules

---

## 9. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Game balance is off (too easy/hard) | High | Medium | Playtesting in Week 8–9; tunable config file |
| Performance issues with simulation | Medium | High | Profiling sessions at M1 and M2 |
| Scope creep from feature requests | High | Medium | Strict change control; Phase 2 backlog |
| Small team bandwidth | Medium | High | Prioritize MVP; cut Phase 1 features if needed |

---

*Last updated: June 2026*
