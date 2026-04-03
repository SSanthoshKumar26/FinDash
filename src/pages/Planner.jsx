import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IndianRupee, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  AlertCircle, 
  CheckCircle2, 
  PieChart, 
  ArrowRight,
  Zap,
  Lightbulb,
  ShieldCheck,
  ZapOff,
  ChevronDown
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';

export default function Planner() {
  const { t } = useTranslation();
  
  // Local currency state based on request
  const [plannerCurrency, setPlannerCurrency] = useState('INR');

  // Input states - these will be treated as being in the selected plannerCurrency
  const [income, setIncome] = useState('');
  const [fixedExpenses, setFixedExpenses] = useState({
    rent: '',
    utilities: '',
    groceries: ''
  });
  const [variableExpenses, setVariableExpenses] = useState({
    transport: '',
    entertainment: '',
    miscellaneous: ''
  });
  const [additionalExpenses, setAdditionalExpenses] = useState('');
  const [savingsGoal, setSavingsGoal] = useState('');

  // Static Conversion Rates (Base INR as requested)
  const CONVERSION_RATES = {
    INR: 1,
    USD: 83,
    EUR: 90
  };

  // Internal calculation function in INR
  const toBase = (amount) => (Number(amount) || 0) * CONVERSION_RATES[plannerCurrency];
  const fromBase = (amountINR) => (amountINR / CONVERSION_RATES[plannerCurrency]);

  // Core Calculations
  const calculations = useMemo(() => {
    // 1. Process all inputs to Base (INR)
    const incomeBase = toBase(income);
    const totalFixedBase = Object.values(fixedExpenses).reduce((a, b) => a + toBase(b), 0);
    const totalVariableBase = Object.values(variableExpenses).reduce((a, b) => a + toBase(b), 0);
    const additionalBase = toBase(additionalExpenses);
    const goalBase = toBase(savingsGoal);

    // 2. Perform Calculations in Base
    const totalExpensesBase = totalFixedBase + totalVariableBase + additionalBase;
    const netSavingsBase = Math.max(0, incomeBase - totalExpensesBase);
    const savingsGapBase = goalBase - netSavingsBase;

    // 3. Goal Analysis
    const goalAchieved = goalBase > 0 ? savingsGapBase <= 0 : false;
    const savingsPercentage = incomeBase > 0 ? (netSavingsBase / incomeBase) * 100 : 0;
    const expenseRatio = incomeBase > 0 ? (totalExpensesBase / incomeBase) * 100 : 0;

    // 4. Financial Health (Good > 30, Moderate 10-30, Poor < 10)
    let healthStatus = 'Poor';
    let healthColor = 'text-rose-500';
    let healthBg = 'bg-rose-500/10';
    
    if (incomeBase > 0) {
      if (savingsPercentage > 30) {
        healthStatus = 'Good';
        healthColor = 'text-emerald-500';
        healthBg = 'bg-emerald-500/10';
      } else if (savingsPercentage >= 10) {
        healthStatus = 'Moderate';
        healthColor = 'text-amber-500';
        healthBg = 'bg-amber-500/10';
      }
    }

    return {
      totalFixedBase,
      totalVariableBase,
      totalExpensesBase,
      netSavingsBase,
      savingsGapBase,
      goalAchieved,
      goalBase,
      savingsPercentage,
      expenseRatio,
      healthStatus,
      healthColor,
      healthBg,
      hasInput: incomeBase > 0
    };
  }, [income, fixedExpenses, variableExpenses, additionalExpenses, savingsGoal, plannerCurrency]);

  // Formatting function as requested
  const formatValue = (valueINR) => {
    const converted = fromBase(valueINR);
    return converted.toLocaleString(plannerCurrency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: plannerCurrency
    });
  };

  const handleFixedChange = (key, value) => {
    setFixedExpenses(prev => ({ ...prev, [key]: value }));
  };

  const handleVariableChange = (key, value) => {
    setVariableExpenses(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <Target className="text-indigo-500" size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-primary">{t('planner.title', 'Smart Financial Planning System')}</h1>
            <p className="text-muted text-[10px] font-bold uppercase tracking-widest opacity-70">{t('planner.subtitle', 'Intelligence-Driven Goal Alignment & Multi-Currency Protocol')}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 group">
          <span className="text-[8px] font-black uppercase tracking-widest text-muted italic ml-1">{t('planner.selectCurrency', 'Deployment Currency')}</span>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500">
               <IndianRupee size={14} />
            </div>
            <select 
              value={plannerCurrency}
              onChange={(e) => setPlannerCurrency(e.target.value)}
              className="bg-panel border border-border/60 text-primary text-xs font-black uppercase tracking-widest rounded-xl pl-9 pr-8 py-2.5 outline-none focus:border-indigo-500/50 transition-all cursor-pointer appearance-none shadow-xl hover:shadow-indigo-500/5"
            >
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
               <ChevronDown size={14} />
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-5 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-5 sm:p-6 space-y-6"
          >
            <div className="flex items-center gap-2 pb-4 border-b border-border/50">
              <IndianRupee size={18} className="text-indigo-500" />
              <h3 className="text-sm font-black uppercase tracking-widest text-primary italic">{t('planner.incomeAndGoal', 'Primary Metrics')} ({plannerCurrency})</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted">{t('planner.monthlyIncome', 'Monthly Income')}</label>
                <input 
                  type="number" 
                  value={income} 
                  placeholder="0.00"
                  onChange={(e) => setIncome(e.target.value)}
                  className="w-full bg-white/5 dark:bg-white/[0.07] border border-border/50 rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-all shadow-inner text-primary placeholder:opacity-30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted">{t('planner.savingsGoal', 'Desired Savings Goal')}</label>
                <input 
                  type="number" 
                  value={savingsGoal} 
                  placeholder="0.00"
                  onChange={(e) => setSavingsGoal(e.target.value)}
                  className="w-full bg-white/5 dark:bg-white/[0.07] border border-border/50 rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-all shadow-inner text-primary placeholder:opacity-30"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/20">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-indigo-500" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t('planner.fixedExpenses', 'Fixed Operating Costs')}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Object.entries(fixedExpenses).map(([key, val]) => (
                  <div key={key} className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-muted">{t(`planner.${key}`, key)}</label>
                    <input 
                      type="number" 
                      value={val} 
                      placeholder="0"
                      onChange={(e) => handleFixedChange(key, e.target.value)}
                      className="w-full bg-white/5 dark:bg-white/[0.07] border border-border/30 rounded-lg px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-indigo-500/50 text-primary"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/20">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-amber-500" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t('planner.variableExpenses', 'Variable Dynamics')}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Object.entries(variableExpenses).map(([key, val]) => (
                  <div key={key} className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-muted">{t(`planner.${key}`, key)}</label>
                    <input 
                      type="number" 
                      value={val} 
                      placeholder="0"
                      onChange={(e) => handleVariableChange(key, e.target.value)}
                      className="w-full bg-white/5 dark:bg-white/[0.07] border border-border/30 rounded-lg px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-amber-500/50 text-primary"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-border/20">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">{t('planner.additionalExpenses', 'Ancillary / One-time Costs')} ({plannerCurrency})</label>
              <input 
                type="number" 
                value={additionalExpenses} 
                placeholder="0"
                onChange={(e) => setAdditionalExpenses(Number(e.target.value))}
                className="w-full bg-white/5 dark:bg-white/[0.07] border border-border/50 rounded-lg px-3 py-3 text-xs font-bold focus:outline-none focus:border-primary/30 text-primary"
              />
            </div>
          </motion.div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel p-6 flex flex-col justify-between"
            >
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted mb-2">{t('planner.totalExpenses', 'Aggregated Burn Rate')}</span>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-black text-primary tracking-tighter">{formatValue(calculations.totalExpensesBase)}</p>
                <div className="text-[10px] font-bold bg-rose-500/10 text-rose-500 px-2 py-1 rounded border border-rose-500/20 italic">
                  {calculations.expenseRatio.toFixed(1)}% {t('planner.ofIncome', 'Ratio')}
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="glass-panel p-6 flex flex-col justify-between overflow-hidden relative"
            >
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted mb-2">{t('planner.netSavings', 'Realized Surplus')}</span>
              <div className="flex items-end justify-between relative z-10">
                <p className="text-3xl font-black text-emerald-500 tracking-tighter">{formatValue(calculations.netSavingsBase)}</p>
                <div className={`text-[10px] font-bold ${calculations.healthBg} ${calculations.healthColor} px-2 py-1 rounded border border-current/20 uppercase tracking-widest`}>
                  {t(`planner.${calculations.healthStatus.toLowerCase()}`, calculations.healthStatus)}
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 opacity-5 rotate-12 text-primary/10">
                <Wallet size={80} />
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-1 rounded-2xl ${calculations.goalAchieved ? 'bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]'} border border-white/5 transition-all duration-500 group`}
          >
            <div className={`bg-panel border border-border/10 rounded-[14px] p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 border-2 ${calculations.goalAchieved ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'bg-rose-500/10 border-rose-500/50 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]'}`}>
                {calculations.goalAchieved ? <CheckCircle2 size={32} /> : <AlertCircle size={32} className="animate-pulse" />}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl font-black uppercase tracking-tight text-primary mb-1">
                  {calculations.goalAchieved ? t('planner.goalMet', 'Target Parameter Achieved') : t('planner.goalMissed', 'Structural Reserve Deficit')}
                </h2>
                <p className="text-muted text-xs font-semibold max-w-md">
                  {calculations.goalAchieved 
                    ? t('planner.goalMetDesc', 'Your current resource allocation fully supports your desired terminal savings state.') 
                    : t('planner.goalMissedDesc', 'Significant calibration required in variable expenditure to align with target benchmarks.')}
                </p>
              </div>

              {!calculations.goalAchieved && calculations.goalBase > 0 && (
                <div className="bg-background/80 backdrop-blur-sm border border-border p-4 rounded-xl text-center min-w-[140px]">
                  <span className="text-[8px] font-black uppercase tracking-widest text-muted block mb-1">{t('planner.requiredDelta', 'Gap to Target')}</span>
                  <p className="text-xl font-black text-rose-500 tracking-tighter">{formatValue(calculations.savingsGapBase)}</p>
                </div>
              )}

              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Target size={120} className="translate-x-1/3 -translate-y-1/3" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel p-8 border-indigo-500/20 relative overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                <Lightbulb size={20} />
              </div>
              <h3 className="text-lg font-black tracking-tight text-primary">{t('planner.intelligentInsights', 'Protocol Recommendations')}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {calculations.goalAchieved ? (
                <>
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-500">
                      <TrendingUp size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{t('planner.investmentProtocol', 'Investment Protocol')}</span>
                    </div>
                    <p className="text-sm font-semibold text-primary/80 leading-relaxed italic">
                      "{t('planner.investSurplus', 'Optimal surplus detected. Recommend deploying extra savings into low-to-moderate risk growth instruments.')}"
                    </p>
                  </div>
                  <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-500">
                      <Target size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{t('planner.upscalingGoal', 'Goal Calibration')}</span>
                    </div>
                    <p className="text-sm font-semibold text-primary/80 leading-relaxed italic">
                      "{t('planner.increaseGoal', 'Protocol integrity verified. Recommend increasing target savings benchmark by 15% for aggressive compounding.')}"
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-rose-500">
                      <TrendingDown size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{t('planner.exposureReduction', 'Variable Reduction')}</span>
                    </div>
                    <p className="text-sm font-semibold text-primary/80 leading-relaxed italic px-1">
                      {t('planner.reduceVariable', 'Execute')} <span className="text-rose-500 font-black">{(calculations.totalVariableBase > 0 ? (calculations.savingsGapBase / calculations.totalVariableBase) * 100 : 0).toFixed(0)}%</span> {t('planner.cutAction', 'reduction in the variable expense sector to neutralize the current gap.')}
                    </p>
                  </div>
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-amber-500">
                      <ArrowRight size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{t('planner.spendingLimit', 'New Allocation Ceiling')}</span>
                    </div>
                    <p className="text-sm font-semibold text-primary/80 leading-relaxed italic px-1">
                      {t('planner.newLimit', 'Hard spending limit enforced at')} <span className="text-amber-500 font-black">{formatValue(toBase(income) - toBase(savingsGoal))}</span> {t('planner.limitPeriod', 'to maintain operational consistency.')}
                    </p>
                  </div>
                  <div className="md:col-span-2 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 group">
                    <div className="p-3 bg-indigo-500/10 rounded-full text-indigo-500 group-hover:scale-110 transition-transform">
                      <Zap size={24} />
                    </div>
                    <div className="text-center sm:text-left flex-1">
                      <p className="text-xs font-bold text-primary italic mb-1 uppercase tracking-tight">
                        "{t('planner.cutEntertainment', 'Terminate entertainment flows by')} <span className="text-indigo-500 font-black underline decoration-2 decoration-indigo-500/30 underline-offset-4">{formatValue(Math.min(toBase(variableExpenses.entertainment), calculations.savingsGapBase))}</span> {t('planner.cutActionEnd', 'to immediately recover system delta.')}"
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="absolute -bottom-[20%] -left-[5%] text-[15rem] font-bold opacity-[0.02] pointer-events-none select-none tracking-tighter italic">
              INSIGHT
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
