import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, TrendingUp, TrendingDown, Wallet, AlertCircle, 
  CheckCircle2, PieChart as PieIcon, ArrowRight, Zap, 
  Lightbulb, ShieldCheck, IndianRupee, ChevronDown, 
  LayoutGrid, Activity, DollarSign, Euro, Calculator,
  BarChart3, Lock as LockIcon
} from 'lucide-react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip as RechartsTooltip, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';

const BUDGET_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

// Conversion Rates relative to 1 USD
const RATES = {
  USD: 1,
  EUR: 0.92,
  INR: 83.0
};

const MetricSection = ({ title, value, icon: Icon, colorClass, trend, status }) => {
  const { t } = useTranslation();
  return (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-5 border border-white/10 bg-black/5 flex flex-col justify-between h-full rounded-xl transition-all hover:bg-black/10"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2.5 bg-${colorClass}/10 border border-${colorClass}/20 text-${colorClass} rounded-lg`}>
        <Icon size={20} />
      </div>
      {status && (
        <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border border-current/20 ${
          status === 'danger' ? 'bg-rose-500/10 text-rose-500' : 
          status === 'warning' ? 'bg-amber-500/10 text-amber-500' : 
          'bg-emerald-500/10 text-emerald-500'
        }`}>
          {status}
        </div>
      )}
    </div>
    <div>
      <p className="text-muted text-[10px] font-black uppercase tracking-widest mb-1 opacity-60 font-sans">{t(`planner.${title.toLowerCase().replace(/\s/g, '')}`, title)}</p>
      <h3 className="text-2xl font-black tracking-tight text-primary tabular-nums font-sans">{value}</h3>
    </div>
  </motion.div>
  );
};

const CategoryRow = ({ name, budget, actual, onUpdate, formatValue, type, disabled }) => {
  const { t } = useTranslation();
  const percent = budget > 0 ? (actual / budget) * 100 : 0;
  const status = percent > 100 ? 'danger' : percent > 80 ? 'warning' : 'safe';
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-5 hover:bg-white/5 transition-colors items-center border-b border-white/5 last:border-0">
      <div className="lg:col-span-3 flex items-center gap-3">
         <div className={`p-2 rounded-lg ${type === 'fixed' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'} border border-current/10`}>
            {type === 'fixed' ? <ShieldCheck size={16} /> : <Zap size={16} />}
         </div>
         <h4 className="text-xs font-black uppercase tracking-widest text-primary font-sans">{t(`planner.categories.${name.toLowerCase()}`, name)}</h4>
      </div>
      
      <div className="lg:col-span-5 grid grid-cols-2 gap-3">
        <div className="relative">
          <p className="text-[8px] font-black uppercase tracking-widest text-muted mb-1.5 ml-1">{t('planner.limit', 'Limit')}</p>
          <input 
            type="number" 
            value={budget === 0 ? '' : budget}
            onChange={(e) => onUpdate(name, 'budget', e.target.value)}
            disabled={disabled}
            className={`w-full bg-black/20 border border-white/10 rounded-lg py-2.5 px-3 text-xs font-bold text-primary focus:border-indigo-500 outline-none transition-all placeholder:text-muted/30 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder="0.00"
          />
        </div>
        <div className="relative">
          <p className="text-[8px] font-black uppercase tracking-widest text-muted mb-1.5 ml-1">{t('planner.actual', 'Actual')}</p>
          <input 
            type="number" 
            value={actual === 0 ? '' : actual}
            onChange={(e) => onUpdate(name, 'actual', e.target.value)}
            disabled={disabled}
            className={`w-full bg-black/20 border border-white/10 rounded-lg py-2.5 px-3 text-xs font-bold text-primary focus:border-indigo-500 outline-none transition-all placeholder:text-muted/30 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="lg:col-span-4 space-y-2">
         <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest leading-none">
           <span className="text-muted/60">{t('planner.velocity', 'Velocity')}</span>
           <span className={status === 'danger' ? 'text-rose-500' : status === 'warning' ? 'text-amber-500' : 'text-emerald-500'}>
             {percent.toFixed(0)}% <span className="text-muted/30 ml-1">({formatValue(Math.max(0, budget - actual))})</span>
           </span>
         </div>
         <div className="h-1.5 w-full bg-black/40 rounded-sm overflow-hidden border border-white/5">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${Math.min(100, percent)}%` }}
             className={`h-full transition-all duration-1000 ${
               status === 'danger' ? 'bg-rose-500' : 
               status === 'warning' ? 'bg-amber-500' : 
               'bg-emerald-500'
             }`}
           />
         </div>
      </div>
    </div>
  );
};

export default function Planner() {
  const { t } = useTranslation();
  const { role } = useStore();
  const isAdmin = role === 'Admin';
  const [currency, setCurrency] = useState('USD');
  const [prevCurrency, setPrevCurrency] = useState('USD');

  const [incomeVal, setIncomeVal] = useState(5000);
  const [goalVal, setGoalVal] = useState(1000);
  
  const [fixedData, setFixedData] = useState({
    Rent: { budget: 1500, actual: 1500 },
    Utilities: { budget: 300, actual: 280 },
    Groceries: { budget: 400, actual: 350 },
  });
  
  const [variableData, setVariableData] = useState({
    Transport: { budget: 200, actual: 150 },
    Entertainment: { budget: 300, actual: 320 },
    Miscellaneous: { budget: 200, actual: 90 },
  });

  useEffect(() => {
    if (currency === prevCurrency) return;
    const factor = RATES[currency] / RATES[prevCurrency];
    setIncomeVal(prev => parseFloat((prev * factor).toFixed(2)) || 0);
    setGoalVal(prev => parseFloat((prev * factor).toFixed(2)) || 0);
    
    const convertMap = (prevMap) => {
        const next = {};
        Object.entries(prevMap).forEach(([k, v]) => {
            next[k] = { 
                budget: parseFloat((v.budget * factor).toFixed(2)) || 0, 
                actual: parseFloat((v.actual * factor).toFixed(2)) || 0 
            };
        });
        return next;
    };
    setFixedData(prev => convertMap(prev));
    setVariableData(prev => convertMap(prev));
    setPrevCurrency(currency);
  }, [currency]);

  const handleUpdate = (setter) => (name, field, value) => {
    const numericVal = value === '' ? 0 : parseFloat(value);
    setter(prev => ({
      ...prev,
      [name]: { ...prev[name], [field]: numericVal }
    }));
  };

  const calculations = useMemo(() => {
    const sumField = (obj, field) => Object.values(obj).reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
    const totalActual = sumField(fixedData, 'actual') + sumField(variableData, 'actual');
    const surplus = incomeVal - totalActual;
    const savingsRate = incomeVal > 0 ? (surplus / incomeVal) * 100 : 0;
    const burnRate = incomeVal > 0 ? (totalActual / incomeVal) * 100 : 0;
    
    const insights = [];
    if (surplus < 0) insights.push({ color: 'text-rose-500', text: t('planner.deficitDetected', 'Critical structural deficit detected.') });
    if (savingsRate < 20) insights.push({ color: 'text-amber-500', text: t('planner.velocityWarning', 'Savings velocity under industry standard (20%).') });
    if (surplus >= goalVal && goalVal > 0) insights.push({ color: 'text-emerald-500', text: t('planner.targetSuccess', 'Savings target successfully initialized.') });

    const chartData = Object.entries({...fixedData, ...variableData})
      .map(([name, val]) => ({ name, value: val.actual }));

    const barData = Object.entries({...fixedData, ...variableData})
      .map(([name, val]) => ({ name, Budget: val.budget, Actual: val.actual }));

    return { totalActual, surplus, savingsRate, burnRate, insights, chartData, barData };
  }, [incomeVal, goalVal, fixedData, variableData]);

  const formatValue = (val) => {
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', currency, maximumFractionDigits: 0 
    }).format(val);
  };

  return (
    <div className="space-y-8 pb-[100px] max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      {/* Blunt Edged Header */}
      <header id="planner-hero" className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/5 pb-8">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
              <Calculator size={28} className="text-primary" />
           </div>
           <div>
              <h1 className="text-3xl font-black tracking-tighter text-primary uppercase font-sans">Financial Intelligence Hub</h1>
              <div className="flex items-center gap-3 mt-1">
                 <p className="text-muted text-[10px] font-black uppercase tracking-[0.3em] font-sans">Real-time Fiscal Control Center</p>
                 {!isAdmin && (
                   <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[8px] font-black uppercase tracking-widest animate-pulse">
                      <LockIcon size={10} /> READ ONLY MODE
                   </div>
                 )}
              </div>
           </div>
        </div>

        <div className="flex bg-black/20 border border-white/5 rounded-lg p-1">
           {['USD', 'EUR', 'INR'].map((cur) => (
             <button
                key={cur}
                onClick={() => setCurrency(cur)}
                className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  currency === cur ? 'bg-primary text-background' : 'text-muted hover:text-primary'
                }`}
             >
                {cur}
             </button>
           ))}
        </div>
      </header>

      {/* Input Parameters Section - Flattened Layout */}
      <section id="planner-inputs" className="border border-white/10 p-6 rounded-xl bg-black/5 overflow-hidden">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1 font-sans">{t('planner.liquidInflow', 'Strategic Liquid Inflow')}</label>
               <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/50 border-r border-white/10 pr-3">
                     {currency === 'INR' ? <IndianRupee size={16} /> : currency === 'EUR' ? <Euro size={16} /> : <DollarSign size={16} />}
                  </div>
                  <input 
                     type="number"
                     value={incomeVal === 0 ? '' : incomeVal}
                     onChange={(e) => setIncomeVal(parseFloat(e.target.value) || 0)}
                     disabled={!isAdmin}
                     className={`w-full bg-black/20 border border-white/10 rounded-lg py-4 pl-16 pr-5 text-2xl font-black tracking-tight text-primary focus:border-primary outline-none transition-all placeholder:text-muted/10 font-sans ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                     placeholder="0.00"
                  />
               </div>
            </div>
            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1 font-sans">{t('planner.targetBenchmark', 'Terminal Target Benchmark')}</label>
               <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/50 border-r border-white/10 pr-3">
                     <Target size={16} />
                  </div>
                  <input 
                     type="number"
                     value={goalVal === 0 ? '' : goalVal}
                     onChange={(e) => setGoalVal(parseFloat(e.target.value) || 0)}
                     disabled={!isAdmin}
                     className={`w-full bg-black/20 border border-white/10 rounded-lg py-4 pl-16 pr-5 text-2xl font-black tracking-tight text-primary focus:border-primary outline-none transition-all placeholder:text-muted/10 font-sans ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                     placeholder="0.00"
                  />
               </div>
            </div>
         </div>
      </section>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <MetricSection title={t('planner.allocatedBurn', 'Allocated Resource Burn')} value={formatValue(calculations.totalActual)} icon={BarChart3} colorClass="rose-500" status={calculations.burnRate > 80 ? 'warning' : 'safe'} />
         <MetricSection title={t('planner.fiscalSurplus', 'Available Fiscal Surplus')} value={formatValue(calculations.surplus)} icon={Wallet} colorClass="emerald-500" status={calculations.surplus < 0 ? 'danger' : 'safe'} />
         <MetricSection title={t('planner.burnIntensity', 'Liquidity Burn Intensity')} value={`${calculations.burnRate.toFixed(0)}%`} icon={Activity} colorClass="amber-500" />
         <MetricSection title={t('planner.assetVelocity', 'Strategic Asset Velocity')} value={`${calculations.savingsRate.toFixed(0)}%`} icon={TrendingUp} colorClass="indigo-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
         <div id="fixed-allocation" className="xl:col-span-8 border border-white/10 rounded-xl bg-black/5 overflow-hidden">
            <div className="p-5 border-b border-white/10 bg-white/[0.02]">
               <h2 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2 font-sans">
                  <ShieldCheck size={16} className="text-indigo-400" />
                  {t('planner.primaryAllocation', 'Primary Infrastructure Allocation')}
               </h2>
            </div>
            <div className="flex flex-col">
               {Object.entries(fixedData).map(([name, data]) => (
                  <CategoryRow key={name} name={name} {...data} onUpdate={handleUpdate(setFixedData)} formatValue={formatValue} type="fixed" disabled={!isAdmin} />
               ))}
            </div>
            
            <div className="p-5 border-b border-t border-white/10 bg-white/[0.02]">
               <h2 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2 font-sans">
                  <Zap size={16} className="text-amber-400" />
                  {t('planner.operationalFlux', 'Operational Sector Flux')}
               </h2>
            </div>
            <div className="flex flex-col">
               {Object.entries(variableData).map(([name, data]) => (
                  <CategoryRow key={name} name={name} {...data} onUpdate={handleUpdate(setVariableData)} formatValue={formatValue} type="variable" disabled={!isAdmin} />
               ))}
            </div>
         </div>

         <aside className="xl:col-span-4 space-y-8">
            <div id="planner-insights" className="border border-white/10 p-6 rounded-xl bg-black/5">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2 border-b border-white/5 pb-4 font-sans">
                  <Lightbulb size={14} className="text-indigo-400" />
                  {t('planner.predictiveAnalysis', 'Predictive Analysis')}
               </h3>
               <div className="space-y-4">
                  {calculations.insights.length > 0 ? calculations.insights.map((insight, i) => (
                    <div key={i} className="flex gap-3 items-start animate-in slide-in-from-right duration-500">
                       <ArrowRight size={14} className={`mt-0.5 shrink-0 ${insight.color}`} />
                       <p className={`text-[10px] uppercase font-black tracking-widest leading-relaxed ${insight.color} font-sans`}>{insight.text}</p>
                    </div>
                  )) : (
                    <p className="text-[10px] uppercase font-black text-muted tracking-widest text-center py-6 italic font-sans opacity-40">{t('planner.allSystemsOptimal', 'All systems functioning within operational parameters.')}</p>
                  )}
               </div>
            </div>

            <div className="border border-white/10 p-8 rounded-xl bg-black/5">
               <div className="h-48 relative mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={calculations.chartData}
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={4}
                           dataKey="value"
                           stroke="none"
                        >
                           {calculations.chartData.map((e, index) => (
                              <Cell key={`cell-${index}`} fill={BUDGET_COLORS[index % BUDGET_COLORS.length]} fillOpacity={0.7} />
                           ))}
                        </Pie>
                        <RechartsTooltip 
                           contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '8px' }}
                           itemStyle={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }}
                        />
                     </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-xl font-black text-primary font-sans">{calculations.burnRate.toFixed(0)}%</span>
                     <span className="text-[8px] font-black text-muted uppercase tracking-widest font-sans">{t('planner.used', 'Used')}</span>
                  </div>
               </div>

               <div className="h-48 w-full border-t border-white/5 pt-8">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={calculations.barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 7, fill: 'rgba(255,255,255,0.2)', fontWeight: '900' }} dy={10} />
                      <YAxis hide />
                      <RechartsTooltip 
                         cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                         contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '8px' }}
                         itemStyle={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }}
                      />
                      <Bar dataKey="Limit" fill="rgba(255,255,255,0.05)" radius={[2,2,0,0]} barSize={8} />
                      <Bar dataKey="Spent" fill="#6366f1" radius={[2,2,0,0]} barSize={8} />
                   </BarChart>
                </ResponsiveContainer>
               </div>
            </div>
         </aside>
      </div>
    </div>
  );
}
