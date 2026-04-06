# 🚀 FinDash - Elite Financial Intelligence Terminal

[![Live Demo](https://img.shields.io/badge/Live-Demo-emerald?style=for-the-badge&logo=vercel)](https://fin-dash-six-gamma.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-indigo?style=for-the-badge&logo=github)](https://github.com/SSanthoshKumar26/FinDash)

**🌍 Live Deployment:** [https://fin-dash-six-gamma.vercel.app/](https://fin-dash-six-gamma.vercel.app/)

## 💎 Project Overview
**FinDash** is a high-performance, professional financial terminal designed for enterprise-grade data visualization and personal wealth management. Built with a "Terminal First" aesthetic, it prioritizes structured data, real-time intelligence flow, and an ultra-premium technical experience.

The platform is powered by **FinDash AI**, a context-aware assistant providing deep analytical insights, and features a redundant **Zero-Backend Deterministic Data Architecture**.

---

## 🔥 Strategic functional Nodes (Key Features)

### 1. 🤖 FinDash AI (Deep Context Integration)
A deeply integrated intelligent assistant that understands your entire financial ecosystem.
- **Context-Aware**: Understands exactly which module is active (Dashboard, Planner, or Analytics) and tailors its responses based on the live dataset.
- **Natural Language Analysis**: Interpret your balance, top spending categories, and burn rate via simple chat queries.

### 2. 🛡️ Multi-Tier RBAC (Role-Based Access Control)
Strict enforcement of operational permissions to simulate a secure enterprise environment:
- **Admin Root Access**: Full CRUD capability on all transactions and budgets. Access to advanced analytics (Risk Radar, Burn Velocity).
- **Viewer Mode**: A strictly read-only experience. Modifier functions are locked, and transaction data is truncated to protect core ledger privacy.

### 3. 📊 Deterministic Data Architecture (100% Real-Time)
- **Zero-Base Calibration**: All dashboard metrics (Total Balance, Income, Expenses) are derived 100% from the transaction history—no hardcoded starting balances.
- **Real-Time Synthesis**: Every addition, deletion, or edit in the ledger propagates instantly across all charts and stat-cards.
- **Analytics Integrity**: Radar Charts and Heatmaps now use deterministic frequency-hash algorithms instead of random generators, ensuring mathematical consistency.

### 4. 🧭 Intelligence Guided Onboarding
- **Multi-Stage Walkthrough**: A high-fidelity spotlight navigation system that ensures new users achieve operational mastery across every functional node.

### 5. 📧 Intelligence Dispatch & Multi-Format Synthesis
- **Decoupled PDF Engine**: A stability-first architecture that renders a separate, simplified report template off-screen to ensure 100% PDF compatibility without modern CSS artifacts.
- **Professional Filename Mapping**: Automated, unique, and enterprise-grade file naming (e.g., `FinDash_Intelligence_Dossier_[Timestamp].pdf`).
- **High-Contrast Terminal Loading**: A professional terminal-style loading interface with vertically scanning laser effects and 95% opacity to ensure zero background interference.

---

## 🏛️ System Architecture

### 📊 PDF synthesis Node (Stability-First)
To solve the "Modern CSS vs Canvas" conflict:
- **UI Node**: High-fidelity glassmorphism, `oklch` colors, and blur filters for the live user experience.
- **Export Node**: A hidden, static HTML component with standard HEX/RGB colors and solid backgrounds. This ensures `html2canvas` captures a perfect, error-free snapshot every time.

### 📈 Recharts Calibration
- **Stability Wrappers**: Every visualization uses `ResponsiveContainer` wrapped in defensive `min-h` containers to prevent dimension-zero calculation errors during component mounting.
- **Deterministic Metrics**: Radar charts map performance based on **Savings Rate**, **Stability**, **Diversity**, and **Activity Volume** instead of static mocks.

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
│   │   ├── Dashboard/      # Main Intel Hub
│   │   ├── Analytics/      # Deep Matrix Analysis
│   │   ├── Transactions/   # Ledger Management
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
