import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, 
  PieChart, Pie, Cell, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, 
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend 
} from 'recharts';
import { 
  Target, TrendingUp, AlertTriangle, Crosshair, 
  BarChart3, LineChart as LineIcon, PieChart as PieIcon, 
  AreaChart as AreaIcon, LayoutGrid, ChevronDown, 
  Activity, Globe, Filter, Maximize2, Zap, 
  Timer, Calculator, ShieldCheck
} from 'lucide-react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const CustomTooltip = ({ active, payload, label, dropdownOpen }) => {
  const { t } = useTranslation();
  const { theme } = useStore();
  const isDark = theme === 'dark';
  
  if (active && payload && payload.length && !dropdownOpen) {
    return (
      <div className={`${isDark ? 'bg-[#0f0f0f] border-white/20' : 'bg-white border-black/10 shadow-xl'} border p-4 rounded-xl z-[1000] relative`}>
        <p className={`text-[10px] font-bold uppercase mb-3 border-b ${isDark ? 'text-white/40 border-white/5' : 'text-black/40 border-black/5'} pb-2`}>{label} {t('analytics.forecast', 'Forecast')}</p>
        <div className="space-y-2">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: entry.color }} />
                <span className={`text-[10px] font-bold uppercase ${isDark ? 'text-white/60' : 'text-black/60'}`}>{entry.name}</span>
              </div>
              <span className={`text-xs font-bold tabular-nums ${isDark ? 'text-white' : 'text-black'}`}>
                ${entry.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { transactions, role, theme } = useStore();
  const isDark = theme === 'dark';
  const { t } = useTranslation();
  const [chartType, setChartType] = useState(() => localStorage.getItem('analyticsChartType') || 'area');
  const [timeRange, setTimeRange] = useState('monthly');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(null);
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(null);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  useEffect(() => {
    localStorage.setItem('analyticsChartType', chartType);
  }, [chartType]);

  const chartData = useMemo(() => {
    const dataMap = {};
    const categoryMap = {};
    
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedTransactions.forEach(tx => {
      const date = new Date(tx.date);
      let label;
      let order;

      if (timeRange === 'monthly') {
        label = date.toLocaleDateString('en-US', { month: 'short' });
        order = date.getMonth();
      } else {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(d.setDate(diff));
        label = startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        order = startOfWeek.getTime();
      }
      
      if (!dataMap[label]) {
        dataMap[label] = { name: label, income: 0, expenses: 0, savings: 0, order: order };
      }
      
      const absAmt = Math.abs(tx.amount);
      if (tx.type === 'income') {
        dataMap[label].income += absAmt;
      } else {
        dataMap[label].expenses += absAmt;
        if (categoryFilter === 'all' || tx.category === categoryFilter) {
          categoryMap[tx.category] = (categoryMap[tx.category] || 0) + absAmt;
        }
      }
      dataMap[label].savings = Math.max(0, dataMap[label].income - dataMap[label].expenses);
    });

    const trend = Object.values(dataMap).sort((a,b) => a.order - b.order);
    const categories = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    return { trend, categories };
  }, [transactions, categoryFilter, timeRange]);

  const categories = ['all', ...new Set(transactions.map(t => t.category))];

  const chartOptions = [
    { id: 'area', name: t('analytics.matrixOverview', 'Matrix Overview'), icon: AreaIcon },
    { id: 'bar', name: t('analytics.volumeStats', 'Volume Stats'), icon: BarChart3 },
    { id: 'line', name: t('analytics.velocityTrend', 'Velocity Trend'), icon: LineIcon },
    { id: 'pie', name: t('analytics.assetShares', 'Asset Shares'), icon: PieIcon },
    { id: 'donut', name: t('analytics.distribution', 'Distribution'), icon: LayoutGrid },
    { id: 'radar', name: t('analytics.riskPerimeter', 'Risk Perimeter'), icon: Globe },
  ];

  const renderChart = () => {
    const commonProps = {
      margin: { top: 10, right: 10, left: -20, bottom: 0 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={chartData.trend} syncId="analyticsSync" {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 10, fontWeight: 700 }} dy={10} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip dropdownOpen={isDropdownOpen === 'type'} />} cursor={false} />
            <Bar dataKey="income" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} name={t('analytics.income', 'Income')} />
            <Bar dataKey="expenses" fill={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} radius={[4, 4, 0, 0]} barSize={24} name={t('analytics.expenses', 'Expenses')} />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={chartData.trend} syncId="analyticsSync" {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 10, fontWeight: 700 }} dy={10} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip dropdownOpen={isDropdownOpen === 'type'} />} cursor={false} />
            <Line type="monotone" dataKey="income" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6, stroke: isDark ? '#fff' : '#000', strokeWidth: 2 }} name={t('analytics.income', 'Income')} />
            <Line type="monotone" dataKey="expenses" stroke={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"} strokeWidth={3} dot={{ r: 4, fill: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)" }} name={t('analytics.expenses', 'Expenses')} />
          </LineChart>
        );
      case 'pie':
      case 'donut':
        return (
          <PieChart>
            <Pie
              data={chartData.categories}
              cx="50%"
              cy="50%"
              innerRadius={chartType === 'donut' ? 70 : 0}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              stroke={isDark ? "#0c0c0c" : "#fff"}
              strokeWidth={2}
            >
              {chartData.categories.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.9} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip dropdownOpen={isDropdownOpen === 'type'} />} />
          </PieChart>
        );
      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData.trend}>
            <PolarGrid stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
            <PolarAngleAxis dataKey="name" tick={{ fill: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 10, fontWeight: 700 }} />
            <Radar name={t('analytics.income', 'Income')} dataKey="income" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.3} />
            <Radar name={t('analytics.expenses', 'Expenses')} dataKey="expenses" stroke={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"} strokeWidth={2} fill={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"} fillOpacity={0.1} />
            <Tooltip content={<CustomTooltip dropdownOpen={isDropdownOpen === 'type'} />} />
          </RadarChart>
        );
      case 'area':
      default:
        return (
          <AreaChart data={chartData.trend} syncId="analyticsSync" {...commonProps}>
            <defs>
              <linearGradient id="areaInc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4}/>
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 10, fontWeight: 700 }} dy={10} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip dropdownOpen={isDropdownOpen === 'type'} />} cursor={false} />
            <Area type="monotone" dataKey="income" stroke="#6366f1" strokeWidth={3} fill="url(#areaInc)" activeDot={{ r: 6, fill: isDark ? '#fff' : '#000' }} name={t('analytics.income', 'Income')} />
            <Area type="monotone" dataKey="expenses" stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} fill="transparent" name={t('analytics.expenses', 'Expenses')} />
          </AreaChart>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-16 max-w-[1700px] mx-auto overflow-x-hidden px-3 sm:px-6 lg:px-8 pt-4">
      {/* Unique Analytics Header */}
      <header id="analytics-hero" className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-indigo-500 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                <Target size={22} className="text-white" />
             </div>
             <div>
               <h1 className="text-3xl font-black tracking-tight text-primary uppercase italic">{t('analytics.forecastingHub', 'Forecasting Hub')}</h1>
               <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-1">{t('analytics.forecastingSubtitle', 'Advanced Quantitative Intelligence')}</p>
             </div>
          </div>
          <div className="flex gap-2">
             <div className="px-4 py-1.5 rounded-xl bg-panel border border-border flex items-center gap-2">
                <ShieldCheck size={12} className={role === 'Admin' ? 'text-emerald-500' : 'text-amber-500'} />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">{role === 'Admin' ? 'Root Access' : 'Restricted Node'}</span>
             </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           {role === 'Admin' && (
             <div className="flex items-center gap-2 bg-background border border-border p-1 rounded-xl">
              {['monthly', 'weekly'].map((range) => (
                <button 
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${timeRange === range ? (isDark ? 'bg-white text-black' : 'bg-black text-white') : 'text-muted hover:text-primary hover:bg-panel'}`}
                >
                  {t(`analytics.${range}`, range === 'monthly' ? 'Monthly' : 'Weekly')}
                </button>
              ))}
            </div>
           )}
          <div className="h-10 w-px bg-border mx-2 hidden md:block" />
          <div className="flex items-center gap-3 px-5 py-3 bg-background border border-border rounded-2xl shadow-inner relative overflow-hidden group">
             <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] relative" />
             <span className="text-[10px] font-black text-muted uppercase tracking-tighter relative">{t('analytics.synced', 'Node Sync')}: <span className="text-primary">{lastSync}</span></span>
          </div>
        </div>
      </header>

      {/* Analytical Metrics */}
      <div id="analytics-metrics" className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-10">
        <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-indigo-500/[0.03] to-transparent relative overflow-hidden group">
          <div className="flex justify-between items-start mb-8">
            <div className="p-3 bg-background border border-border rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform">
              <Timer size={20} strokeWidth={1} />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-muted uppercase">Est. Capital Runway</span>
              <p className="text-sm font-bold text-emerald-500 mt-1 uppercase">
                {timeRange === 'monthly' ? 'Projected Path' : 'Short-term Stability'}
              </p>
            </div>
          </div>
          <p className="text-4xl font-bold text-primary tracking-tighter mb-4">
            {timeRange === 'monthly' ? '18.4 Months' : '72.8 Weeks'}
          </p>
          <div className="w-full h-1.5 bg-background rounded-full overflow-hidden border border-border">
             <motion.div 
               key={timeRange}
               initial={{width: 0}} 
               animate={{width: timeRange === 'monthly' ? '65%' : '45%'}} 
               transition={{duration: 2}} 
               className="h-full bg-indigo-500" />
          </div>
          <p className="text-[10px] font-bold text-muted-color uppercase mt-4 leading-none italic">
            {timeRange === 'monthly' ? 'Historical burn average' : 'Current week intensity'}
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-emerald-500/[0.03] to-transparent relative overflow-hidden group">
          <div className="flex justify-between items-start mb-8">
            <div className="p-3 bg-background border border-border rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform">
              <Calculator size={20} strokeWidth={1} />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-muted uppercase">Savings velocity</span>
              <p className="text-sm font-bold text-indigo-400 mt-1 uppercase">+15.2% Accel</p>
            </div>
          </div>
          <p className="text-4xl font-bold text-primary tracking-tighter mb-4">$3,420.00 <span className="text-lg text-muted opacity-40">/mo</span></p>
          <p className="text-[10px] font-bold text-muted uppercase leading-none mt-auto italic">Aggregated assets</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-amber-500/[0.03] to-transparent relative overflow-hidden group">
          <div className="flex justify-between items-start mb-8">
            <div className="p-3 bg-background border border-border rounded-2xl text-amber-400 group-hover:scale-110 transition-transform">
              <ShieldCheck size={20} strokeWidth={1} />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-muted uppercase">Confidence rating</span>
              <p className="text-sm font-bold text-amber-400 mt-1 uppercase">Reliable Data</p>
            </div>
          </div>
          <p className="text-4xl font-bold text-primary tracking-tighter mb-4">98.2%</p>
          <div className="flex gap-1.5 mt-auto">
             {[...Array(12)].map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-sm ${i < 10 ? 'bg-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.3)]' : (isDark ? 'bg-white/5' : 'bg-black/5')}`} />
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8">
          <section id="analytics-grid" className="glass-panel p-5 sm:p-8 lg:p-8 rounded-2xl relative overflow-visible h-full">
            <div className="relative z-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6 px-0 sm:px-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-primary tracking-tight uppercase">{t('analytics.liquidityProjection', 'Liquidity Projection')}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-bold text-muted uppercase">{t('analytics.liveDataFeed', 'Live Data Feed')}</span>
                  <div className="h-px w-10 bg-border" />
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 relative z-[200] w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none" ref={dropdownRef}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(prev => prev === 'type' ? null : 'type'); }}
                    className="flex items-center justify-between gap-3 px-4 py-3 bg-background border border-border rounded-xl hover:border-primary/30 transition-all w-full sm:min-w-[220px] shadow-2xl"
                  >
                    <span className="text-[11px] font-bold uppercase text-primary">
                      {chartOptions.find(o => o.id === chartType)?.name}
                    </span>
                    <ChevronDown size={14} className={`text-indigo-400 transition-transform duration-500 shrink-0 ${isDropdownOpen === 'type' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {isDropdownOpen === 'type' && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 10 }}
                        className={`absolute right-0 mt-3 w-full sm:w-64 border border-border rounded-xl shadow-[0_40px_80px_rgba(0,0,0,0.5)] z-[1100] py-3 overflow-hidden ${isDark ? 'bg-[#0a0a0a]' : 'bg-white'}`}
                      >
                        {chartOptions.map((opt) => (
                          <div 
                            key={opt.id}
                            onClick={(e) => { 
                              e.stopPropagation();
                              setChartType(opt.id); 
                              setIsDropdownOpen(null); 
                            }}
                            className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-all cursor-pointer ${chartType === opt.id ? 'bg-indigo-500 text-white' : 'text-muted hover:text-primary hover:bg-panel'}`}
                          >
                            <opt.icon size={16} strokeWidth={2} />
                            <span className="text-[11px] font-bold uppercase">{opt.name}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button className="p-3 sm:p-4 bg-background border border-border rounded-xl text-muted hover:text-primary transition-all shrink-0">
                  <Maximize2 size={16} />
                </button>
              </div>
            </div>

            {/* Chart area — properly centered with flex padding */}
            <div className="h-[280px] sm:h-[340px] lg:h-[400px] w-full relative z-10 flex flex-col justify-center pt-8 sm:pt-14 pb-4">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={chartType}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                  </ResponsiveContainer>
                </motion.div>
              </AnimatePresence>
            </div>
          </section>
        </div>

        <aside className="xl:col-span-4 space-y-6">
          <div className="glass-panel p-6 sm:p-10 rounded-2xl">
            <h3 className="text-[11px] font-black text-primary uppercase mb-6 pb-4 border-b border-border flex justify-between items-center">
               {t('analytics.structuralDist', 'Structural Distribution')}
               <LayoutGrid size={14} className="text-muted opacity-20" />
            </h3>
            <div className="h-[280px] flex flex-col justify-center pt-6">
               <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData.trend}>
                    <PolarGrid stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                    <PolarAngleAxis dataKey="name" tick={{ fill: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', fontSize: 10, fontWeight: 700 }} />
                    <Radar name="Liquidity" dataKey="income" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.2} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
               </ResponsiveContainer>
            </div>
            <div className="space-y-4 mt-8">
               {chartData.categories.slice(0, 4).map((cat, i) => (
                 <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                       <span className="text-[10px] font-bold text-muted uppercase tracking-tight">{cat.name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-primary uppercase tabular-nums">
                      {Math.round((cat.value / chartData.trend.reduce((a, b) => a + b.expenses, 0)) * 100)}%
                    </span>
                 </div>
               ))}
            </div>
          </div>

          <div className="glass-panel p-8 sm:p-10 rounded-2xl">
             <h3 className="text-[11px] font-black text-primary uppercase mb-6 flex items-center gap-4">
                <Globe size={16} className="text-indigo-400" />
                Regional insights
             </h3>
             <div className="space-y-4">
                <div>
                   <p className="text-[9px] font-bold text-muted uppercase mb-3 leading-none italic">Market Exposure</p>
                   <div className="flex items-end gap-1 h-12">
                      {[15, 25, 45, 30, 60, 40, 75, 50, 90].map((h, i) => (
                        <motion.div 
                          key={i} 
                          initial={{height: 0}}
                          animate={{height: `${h}%`}}
                          className={`flex-1 ${isDark ? 'bg-white/5' : 'bg-black/5'} hover:bg-indigo-500/40 transition-colors`} />
                      ))}
                   </div>
                </div>
                <p className="text-[10px] text-muted leading-relaxed font-medium uppercase opacity-60 italic">
                   Real-time asset performance data synchronized across all operational sectors.
                </p>
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
