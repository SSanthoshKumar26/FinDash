# 🚀 FinDash - Elite Financial Intelligence Terminal

[![Live Demo](https://img.shields.io/badge/Live-Demo-emerald?style=for-the-badge&logo=vercel)](https://fin-dash-six-gamma.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-indigo?style=for-the-badge&logo=github)](https://github.com/SSanthoshKumar26/FinDash)

**🌍 Live Deployment:** [https://fin-dash-six-gamma.vercel.app/](https://fin-dash-six-gamma.vercel.app/)

## 💎 Project Overview
**FinDash** is a high-performance, professional financial terminal designed for enterprise-grade data visualization and personal wealth management. Built with a "Terminal First" aesthetic, it prioritizes structured data, real-time intelligence flow, and an ultra-premium technical experience.

The platform is powered by **FinDash AI**, a context-aware assistant providing deep analytical insights, and features a redundant **Zero-Backend Deterministic Data Architecture**.

---

## 🔥 Strategic Functional Nodes (Key Features)

### 1. 🤖 FinDash AI (Deep Context Integration)
A deeply integrated intelligent assistant that understands your entire financial ecosystem.
- **Context-Aware**: Understands exactly which module is active (Dashboard, Planner, or Analytics) and tailors its responses based on the live dataset.
- **Natural Language Analysis**: Interpret your balance, top spending categories, and burn rate via simple chat queries.

### 2. 🎡 Infinity Intelligence Ticker (Real-Time Feed)
- **Seamless Data Flow**: A high-velocity, framer-motion powered infinity scroll ticker that provides real-time financial insights.
- **Dynamic Synthesis**: Analyzes spending efficiency, account summaries, and alert thresholds on-the-fly, presenting only the most actionable intelligence.
- **Premium UI**: Features "Anti-clipping" edge-fade gradients for a cinematic, terminal-grade visual flow.

### 3. 📈 Forecasting Matrix (Enhanced Analytics Hub)
- **Capital Runway Analysis**: Automated projection of financial stability (Months/Weeks) based on historical burn-rate and inflow velocity.
- **Structural Distribution**: A multi-dimensional Radar and Donut analysis of asset allocation and regional market exposure.
- **Reactive Centering**: Graphs are mathematically centered for optimal visual balance across all screen resolutions.

### 4. 🌓 Dual-Theme Intelligence (Light/Dark Mastery)
- **High-Contrast Polish**: A custom-engineered theme engine that ensures 100% visibility for text, numbers, and graph components.
- **Reactive Recharts**: Chart grids, axis labels, and tooltip backgrounds instantly toggle their alpha-transparency and hex-colors to maintain perfect legibility in both environments.

### 5. 📧 Intelligence Dispatch & Multi-Format Synthesis
- **Decoupled PDF Engine**: A stability-first architecture that renders a separate, simplified report template off-screen to ensure 100% PDF compatibility without modern CSS artifacts (glassmorphism/blur).
- **Professional Filename Mapping**: Automated, unique file naming (e.g., `FinDash_Intelligence_Dossier_[Timestamp].pdf`).

---

## 🏛️ System Architecture

### 📊 Deterministic Data Architecture (100% Real-Time)
- **Zero-Base Calibration**: All metrics (Total Balance, Income, Expenses) are derived 100% from the transaction history—no hardcoded starting balances.
- **Real-Time Synthesis**: Every addition, deletion, or edit in the ledger propagates instantly across all charts and stat-cards via a unified Zustand state manager.
- **Analytics Integrity**: Radar Charts and Heatmaps use deterministic frequency-hash algorithms instead of random generators, ensuring mathematical consistency.

### 📊 PDF Synthesis Node (Stability-First)
To solve the "Modern CSS vs Canvas" conflict:
- **UI Node**: High-fidelity glassmorphism, `oklch` colors, and blur filters for the live user experience.
- **Export Node**: A hidden, static HTML component with standard HEX/RGB colors and solid backgrounds for error-free captures.

---

## 🛠️ Technology Stack
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4 (Modern Engine)
- **State**: Zustand (Persistence & Store Architecture)
- **Animation**: Framer Motion (Executive Micro-Interactions)
- **Visualization**: Recharts (High-Fidelity SVG)
- **AI Intelligence**: Groq SDK + Llama 3.3 70B
- **Synthesis**: html2canvas + jsPDF + EmailJS

---

## 📂 Project Structure Map
```text
zorvyn/finance-dashboard/
├── public/                 # Static asset nodes
├── src/
│   ├── components/
│   │   ├── Chatbot/        # AI Intelligence Panel
│   │   ├── Onboarding/     # Product Tour Logic Node
│   │   ├── Layout/         # Sidebar, Topbar, Nav Components
│   │   └── UI/             # Atomic glassmorphic components
│   ├── lib/                # Technical utilities & formatting
│   ├── locales/            # i18n Translation JSON (EN, HI, FR)
│   ├── pages/              # Core Functional Nodes
│   │   ├── Dashboard/      # Main Intel Hub (w/ Infinity Ticker)
│   │   ├── Analytics/      # Deep Matrix Analysis & Forecasting
│   │   ├── Transactions/   # Ledger Management & Exporting
│   │   └── Planner/        # Fiscal Budgeting Node
│   ├── store.js            # Unified State Architecture (Zustand)
│   ├── App.jsx             # Router & Interface Registry
│   └── main.jsx            # System Entry Point
├── .env                    # System environment variables
└── README.md               # Operations Manual
```

---

## 🚀 Installation & Deployment

1. **Node Environment**: Ensure Node.js 18+ is installed.
2. **Sync**:
```bash
git clone https://github.com/SSanthoshKumar26/FinDash.git
cd FinDash
npm install
npm run dev
```

---

## ⚖️ License
MIT License. Designed & Engineered with ❤️ by **Santhosh Kumar**.
