import { create } from 'zustand';
import i18n from './i18n';

const initialTransactions = [
  // March Data
  { id: 1, date: "2026-03-01", name: "Netflix", category: "Subscriptions", amount: -15.99, type: "expense" },
  { id: 2, date: "2026-03-02", name: "Stripe Payout", category: "Income", amount: 4500.00, type: "income" },
  { id: 3, date: "2026-03-05", name: "Whole Foods", category: "Food", amount: -125.50, type: "expense" },
  { id: 4, date: "2026-03-10", name: "Uber", category: "Travel", amount: -24.00, type: "expense" },
  { id: 5, date: "2026-03-15", name: "Github Copilot", category: "Subscriptions", amount: -10.00, type: "expense" },
  { id: 6, date: "2026-03-18", name: "Client Project", category: "Income", amount: 3200.00, type: "income" },
  { id: 7, date: "2026-03-22", name: "Delta Airlines", category: "Travel", amount: -450.00, type: "expense" },
  { id: 8, date: "2026-03-25", name: "Restaurant", category: "Food", amount: -85.00, type: "expense" },
  // February Data
  { id: 9, date: "2026-02-01", name: "Stripe Payout", category: "Income", amount: 4100.00, type: "income" },
  { id: 10, date: "2026-02-14", name: "Apple Store", category: "Subscriptions", amount: -299.00, type: "expense" },
  { id: 11, date: "2026-02-20", name: "Rental Payment", category: "Rent", amount: -1200.00, type: "expense" },
  { id: 12, date: "2026-02-25", name: "Gas Station", category: "Travel", amount: -65.00, type: "expense" },
  // January Data
  { id: 13, date: "2026-01-05", name: "Stripe Payout", category: "Income", amount: 3800.00, type: "income" },
  { id: 14, date: "2026-01-12", name: "Grocery Store", category: "Food", amount: -180.00, type: "expense" },
  { id: 15, date: "2026-01-30", name: "Internet Bill", category: "Subscriptions", amount: -80.00, type: "expense" },
];

export const useStore = create((set, get) => ({
  transactions: initialTransactions,
  role: 'Admin', // 'Admin' | 'Viewer'
  theme: 'dark', 
  privacyMode: false,
  currency: 'USD',
  chatMessages: [
    { id: 1, text: "Hello! I'm your AI financial assistant. How can I help you today?", sender: "bot" }
  ],
  
  // Actions
  addTransaction: (tx) => set((state) => ({ transactions: [tx, ...state.transactions] })),
  deleteTransaction: (id) => set((state) => ({ transactions: state.transactions.filter(tx => tx.id !== id) })),
  updateTransaction: (id, updatedTx) => set((state) => ({
    transactions: state.transactions.map(tx => tx.id === id ? { ...tx, ...updatedTx } : tx)
  })),
  
  setRole: (role) => set({ role }),
  setCurrency: (currency) => set({ currency }),
  togglePrivacy: () => set((state) => ({ privacyMode: !state.privacyMode })),
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { theme: newTheme };
  }),
  
  addChatMessage: (msg) => set((state) => ({ 
    chatMessages: [...state.chatMessages, msg] 
  })),

  formatCurrency: (amount) => {
    const { currency, privacyMode } = get();
    if (privacyMode) return '****';
    
    let converted = amount;
    if (currency === 'INR') converted = amount * 83;
    if (currency === 'EUR') converted = amount * 0.92;
    
    const locale = i18n.language || 'en';
    
    return new Intl.NumberFormat(locale, { 
      style: 'currency', 
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(converted));
  }
}));
