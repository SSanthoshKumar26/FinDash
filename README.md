# 🚀 FinDash - Elite Financial Intelligence Terminal

[![Live Demo](https://img.shields.io/badge/Live-Demo-emerald?style=for-the-badge&logo=vercel)](https://findash-zorvyn.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-indigo?style=for-the-badge&logo=github)](https://github.com/SSanthoshKumar26/FinDash)

## 💎 Project Overview
**FinDash** is a high-performance, professional financial terminal designed for enterprise-grade data visualization and personal wealth management. Built with a "Terminal First" aesthetic, it prioritizes high-contrast typography, real-time data flow, and an ultra-premium dark mode experience.

Inspired by top-tier platforms like Bloomberg and Vercel, it features a completely custom design system using **Tailwind CSS v4** and **Framer Motion** for a seamless, "alive" interface.

---

## 🛠️ Technology Stack
- **Core**: React 19 + Vite (Next-Gen Build Tool)
- **Styling**: Tailwind CSS v4 (Modern CSS Engine)
- **Animations**: Framer Motion (Executive Micro-Interactions)
- **AI Intelligence**: Groq SDK (Llama 3.3 70B Integration)
- **Icons**: Lucide React (Pixel-Perfect Technical Icons)
- **Data Viz**: Recharts (Dynamic Data Layer)
- **State Management**: Zustand (Global Context & Persistence)
- **Internalization**: i18next (Full Multilingual Support)
- **Export Pipeline**: html2canvas + jsPDF (High-Fidelity Document Generation)

---

## 🌊 Project Flow & Working
1. **Authentication (Terminal Access)**:
   - Users enter through a secure, glassmorphic login portal.
   - The system validates identity (dummy auth) and grants access to the operational node.
2. **Global Synchronization (Local & Cloud)**:
   - Real-time conversion between **USD, INR, and EUR** across all dashboard modules.
   - Dynamic role switching (Admin vs. Viewer) to control data modification permissions.
3. **Data Intelligence (FinAI Oracle)**:
   - A proprietary AI assistant (Llama 3.3) analyzes user transactions in real-time.
   - Users can discuss their balance, top spending categories, and financial health directly through a voice-enabled chat interface.
4. **Operations (Protocols & Planning)**:
   - **Operational Protocols**: Strict procedural manual for system data integrity.
   - **Smart Planner**: Currency-aware financial goal setting and gap analysis.
5. **High-Fidelity Reporting**:
   - One-click export of financial insights and transaction ledgers to high-resolution PNG or PDF formats.

---

## 📂 Project Structure
```text
zorvyn/finance-dashboard/
├── src/
│   ├── components/
│   │   ├── Chatbot/           # FinAI Oracle Intelligence
│   │   ├── Effects/           # Aurora, PageLoaders, Mesh Gradients
│   │   ├── Layout/            # Sidebar, Topbar, DashboardLayout
│   │   └── UI/                # Reusable Atomic Elements
│   ├── locales/               # i18n Translation JSONs (en, hi, ta, etc.)
│   ├── pages/                 # Full Page Modules (Dashboard, Analytics, etc.)
│   ├── lib/                   # Utility helpers and Sanitizers
│   ├── store.js               # Global Zustand State Management
│   └── App.jsx                # Router & Theme Registry
├── public/                    # Static Assets
├── tailwind.config.js         # Custom Design Tokens
└── package.json               # dependency Management
```

---

## 🚀 Installation & Deployment

### 1. Requirements
Ensure you have **Node.js 18+** installed on your terminal.

### 2. Local Setup
```bash
# Clone the repository
git clone https://github.com/SSanthoshKumar26/FinDash.git

# Enter the project directory
cd FinDash

# Install the technical stack
npm install

# Initialize the development node
npm run dev
```

### 3. Deployment (Production)
```bash
# Build the production bundle
npm run build

# Deploy to Vercel/Netlify
# Simply connect your GitHub repo for auto-deployment
```

---

## 🌐 Connectivity
- **Repository**: [https://github.com/SSanthoshKumar26/FinDash.git](https://github.com/SSanthoshKumar26/FinDash.git)
- **Live Node**: [https://findash-zorvyn.vercel.app/](https://findash-zorvyn.vercel.app/)

---

## ⚖️ License
This project is licensed under the MIT License - see the LICENSE file for details.
Designed & Engineered with ❤️ by Santhosh Kumar.
