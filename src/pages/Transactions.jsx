import { useState } from 'react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, Edit2, Trash2, X, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function Transactions() {
  const { transactions, role, deleteTransaction, addTransaction, updateTransaction } = useStore();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'General',
    amount: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0]
  });

  const filteredData = transactions
    .filter(tx => tx.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(tx => filterType === 'All' ? true : tx.type === filterType.toLowerCase());

  const handleDelete = (id) => {
    deleteTransaction(id);
    toast.success(t('transactions.deletedSuccess', 'Transaction deleted successfully'));
  };

  const handleOpenModal = (tx = null) => {
    if (tx) {
      setEditingTx(tx);
      setFormData({ name: tx.name, category: tx.category, amount: Math.abs(tx.amount), type: tx.type, date: tx.date });
    } else {
      setEditingTx(null);
      setFormData({ name: '', category: 'General', amount: '', type: 'expense', date: new Date().toISOString().split('T')[0] });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) {
      toast.error(t('transactions.fillRequired', 'Please fill in all required fields'));
      return;
    }

    const payload = {
      ...formData,
      amount: formData.type === 'expense' ? -Math.abs(formData.amount) : Math.abs(formData.amount)
    };

    if (editingTx) {
      updateTransaction(editingTx.id, payload);
      toast.success(t('transactions.updated', 'Transaction updated'));
    } else {
      addTransaction({ ...payload, id: Date.now() });
      toast.success(t('transactions.added', 'New transaction added'));
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">{t('transactions.title', 'Ledger Core')}</h1>
          <p className="text-muted text-xs font-semibold uppercase tracking-widest opacity-70">{t('transactions.subtitle', 'High Performance Transaction Engine')}</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-background font-semibold text-xs transition-all hover:opacity-90 rounded-md shadow-sm"
        >
          <Plus size={16} strokeWidth={2.5} /> {t('transactions.newEntry', 'New Entry')}
        </button>
      </div>

      <div className="glass-panel overflow-hidden mt-8 border-border rounded-xl">
        <div className="p-5 border-b border-border flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50 dark:bg-white/5 backdrop-blur-sm">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder={t('transactions.searchPlaceholder', 'Search Vectors...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 text-primary transition-all shadow-sm placeholder:text-muted/50 font-medium"
            />
          </div>
          
          <div className="flex gap-3">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-background border border-border rounded-md px-4 py-2 text-xs font-semibold text-primary focus:outline-none focus:border-border cursor-pointer w-full sm:w-auto shadow-inner uppercase tracking-wider"
            >
              <option value="All">{t('transactions.filterAll', 'All VECTORS')}</option>
              <option value="Income">{t('transactions.filterInflow', 'Inflow')}</option>
              <option value="Expense">{t('transactions.filterOutflow', 'Outflow')}</option>
            </select>
            <button className="p-2.5 bg-background border border-border rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-muted hover:text-primary shadow-inner">
              <Filter size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-white/10 text-muted uppercase text-[10px] font-black tracking-widest border-b border-border shadow-sm">
                <th className="p-5">{t('transactions.colTimestamp', 'Timestamp')}</th>
                <th className="p-5">{t('transactions.colEntity', 'Entity')}</th>
                <th className="p-5">{t('transactions.colVector', 'Vector Class')}</th>
                <th className="p-5 text-right">{t('transactions.colValue', 'Value')}</th>
                <th className="p-5 text-right">{t('transactions.colOps', 'Operations')}</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode='popLayout'>
                {filteredData.map((tx, idx) => (
                  <motion.tr 
                    key={tx.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="border-b border-border hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="p-5 text-xs font-bold text-muted tabular-nums">{tx.date}</td>
                    <td className="p-5 text-sm font-black text-primary">{tx.name}</td>
                    <td className="p-5">
                      <span className="px-2.5 py-1 rounded-sm text-[10px] font-semibold uppercase tracking-widest border border-border bg-background text-muted">
                        {t(`categories.${tx.category?.toLowerCase()}`, tx.category)}
                      </span>
                    </td>
                    <td className={`p-5 text-sm font-semibold text-right tabular-nums ${tx.type === 'income' ? 'text-emerald-500 dark:text-emerald-400' : 'text-primary'}`}>
                      {tx.type === 'income' ? '+' : '-'}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-5 text-right flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(tx)}
                          className="p-2 text-muted hover:text-primary border border-transparent hover:border-border rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-all outline-none"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(tx.id)}
                          className="p-2 text-rose-500/80 hover:text-rose-600 dark:text-rose-500/60 dark:hover:text-rose-400 border border-transparent hover:border-rose-500/20 rounded-md hover:bg-rose-500/5 transition-all outline-none"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern High-End Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-panel border border-border rounded-lg shadow-2xl overflow-hidden p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-primary tracking-tight">{editingTx ? t('transactions.modifyEntry', 'Modify Entry') : t('transactions.newCoreEntry', 'New Core Entry')}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-muted hover:text-primary rounded-sm bg-background hover:bg-background/80 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted mb-2">{t('transactions.lblEntity', 'Entity Name')}</label>
                  <input 
                    type="text" required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-background border border-border rounded-md p-3 text-sm text-primary focus:outline-none focus:border-primary transition-all placeholder:text-muted/50"
                    placeholder={t('transactions.placeholderEntity', 'e.g. Stripe Cloud')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted mb-2">{t('transactions.lblValue', 'Value (USD)')}</label>
                    <input 
                      type="number" required step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full bg-background border border-border rounded-md p-3 text-sm text-primary focus:outline-none focus:border-primary transition-all tabular-nums"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted mb-2">{t('transactions.lblVectorClass', 'Vector Class')}</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full bg-background border border-border rounded-md p-3 text-sm text-primary focus:outline-none focus:border-primary transition-all uppercase tracking-wider"
                    >
                      <option value="expense">{t('transactions.filterOutflow', 'Outflow')}</option>
                      <option value="income">{t('transactions.filterInflow', 'Inflow')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted mb-2">{t('transactions.lblCategory', 'Category Assignment')}</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-background border border-border rounded-md p-3 text-sm text-primary focus:outline-none focus:border-primary transition-all"
                  >
                    <option value="Subscriptions">{t('categories.subscriptions', 'Subscriptions')}</option>
                    <option value="Food">{t('categories.food', 'Food & Dining')}</option>
                    <option value="Travel">{t('categories.travel', 'Business Travel')}</option>
                    <option value="General">{t('categories.general', 'General Ops')}</option>
                    <option value="Rent">{t('categories.rent', 'Infrastructure')}</option>
                    <option value="Income">{t('categories.revenue', 'Revenue')}</option>
                  </select>
                </div>

                <button type="submit" className="w-full py-3 bg-primary text-background font-semibold text-xs rounded-md shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-2">
                  <Check size={16} strokeWidth={2.5} /> {t('transactions.confirmEntry', 'Confirm Entry')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
