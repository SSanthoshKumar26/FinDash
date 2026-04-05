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
  if (active && payload && payload.length && !dropdownOpen) {
    return (
      <div className="bg-[#0f0f0f] border border-white/20 p-4 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,1)] z-[1000] relative">
        <p className="text-[10px] font-bold text-white/40 uppercase mb-3 border-b border-white/5 pb-2">{label} {t('analytics.forecast', 'Forecast')}</p>
        <div className="space-y-2">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: entry.color }} />
                <span className="text-[10px] font-bold text-white/60 uppercase">{entry.name}</span>
              </div>
              <span className="text-xs font-bold text-white tabular-nums">
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
  const { transactions } = useStore();
  const { t } = useTranslation();
  const [chartType, setChartType] = useState(() => localStorage.getItem('analyticsChartType') || 'area');
  const [timeRange, setTimeRange] = useState('monthly');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(null);
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());
  const [role, setRole] = useState('admin'); // 'admin' or 'viewer'
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
          <BarChart data={chartData.trend} {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }} dy={10} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip dropdownOpen={isDropdownOpen === 'type'} />} cursor={false} />
            <Bar dataKey="income" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} name={t('analytics.income', 'Income')} />
            <Bar dataKey="expenses" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} barSize={24} name={t('analytics.expenses', 'Expenses')} />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={chartData.trend} {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }} dy={10} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip dropdownOpen={isDropdownOpen === 'type'} />} cursor={false} />
            <Line type="monotone" dataKey="income" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} name={t('analytics.income', 'Income')} />
            <Line type="monotone" dataKey="expenses" stroke="rgba(255,255,255,0.2)" strokeWidth={3} dot={{ r: 4, fill: 'rgba(255,255,255,0.2)' }} name={t('analytics.expenses', 'Expenses')} />
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
              stroke="#0c0c0c"
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
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }} />
            <Radar name={t('analytics.income', 'Income')} dataKey="income" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.3} />
            <Radar name={t('analytics.expenses', 'Expenses')} dataKey="expenses" stroke="rgba(255,255,255,0.2)" strokeWidth={2} fill="rgba(255,255,255,0.2)" fillOpacity={0.1} />
            <Tooltip content={<CustomTooltip dropdownOpen={isDropdownOpen === 'type'} />} />
          </RadarChart>
        );
      case 'area':
      default:
        return (
          <AreaChart data={chartData.trend} {...commonProps}>
            <defs>
              <linearGradient id="areaInc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4}/>
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }} dy={10} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip dropdownOpen={isDropdownOpen === 'type'} />} cursor={false} />
            <Area type="monotone" dataKey="income" stroke="#6366f1" strokeWidth={3} fill="url(#areaInc)" activeDot={{ r: 6, fill: '#fff' }} name={t('analytics.income', 'Income')} />
            <Area type="monotone" dataKey="expenses" stroke="rgba(255,255,255,0.1)" fill="transparent" name={t('analytics.expenses', 'Expenses')} />
          </AreaChart>
        );
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 max-w-[1700px] mx-auto overflow-x-hidden px-3 sm:px-6 lg:px-8 pt-4">
      {/* Unique Analytics Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-500 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                <Target size={20} className="text-white" />
             </div>
             <h1 className="text-3xl font-bold tracking-tight text-white uppercase">{t('analytics.forecastingHub', 'Forecasting Hub')}</h1>
          </div>
           <p className="text-[10px] font-medium text-white/40 uppercase">{t('analytics.forecastingSubtitle', 'Advanced analytics and financial forecasting')}</p>
          <div className="flex gap-2 mt-4">
             <button onClick={() => setRole('admin')} className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase transition-all ${role === 'admin' ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-white/5 text-white/20'}`}>{t('roles.admin', 'Admin')}</button>
             <button onClick={() => setRole('viewer')} className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase transition-all ${role === 'viewer' ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-white/5 text-white/20'}`}>{t('roles.viewer', 'Viewer')}</button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           {role === 'admin' && (
             <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10 ring-1 ring-white/5">
              {['monthly', 'weekly'].map((range) => (
                <button 
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase transition-all ${timeRange === range ? 'bg-white text-black shadow-xl shadow-white/10' : 'text-white/40 hover:text-white'}`}
                >
                  {t(`analytics.${range}`, range === 'monthly' ? 'Monthly' : 'Weekly')}
                </button>
              ))}
            </div>
           )}
          <div className="h-10 w-px bg-white/10 mx-2 hidden md:block" />
          {role === 'admin' && (
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-bold text-emerald-500 uppercase">{t('analytics.synced', 'System Synchronized')}: {lastSync}</span>
            </div>
          )}
        </div>
      </header>

      {/* Analytical Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 mb-12">
        <div className="glass-panel p-8 rounded-2xl border border-white/5 bg-gradient-to-br from-indigo-500/[0.03] to-transparent relative overflow-hidden group">
          <div className="flex justify-between items-start mb-12">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform">
              <Timer size={24} strokeWidth={1} />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-white/40 uppercase">Est. Capital Runway</span>
              <p className="text-sm font-bold text-emerald-500 mt-1 uppercase">
                {timeRange === 'monthly' ? 'Projected Path' : 'Short-term Stability'}
              </p>
            </div>
          </div>
          <p className="text-4xl font-bold text-white tracking-tighter mb-4">
            {timeRange === 'monthly' ? '18.4 Months' : '72.8 Weeks'}
          </p>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
             <motion.div 
               key={timeRange}
               initial={{width: 0}} 
               animate={{width: timeRange === 'monthly' ? '65%' : '45%'}} 
               transition={{duration: 2}} 
               className="h-full bg-indigo-500" />
          </div>
          <p className="text-[10px] font-bold text-white/20 uppercase mt-4 leading-none">
            {timeRange === 'monthly' ? 'Historical burn average' : 'Current week intensity'}
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-white/5 bg-gradient-to-br from-emerald-500/[0.03] to-transparent relative overflow-hidden group">
          <div className="flex justify-between items-start mb-12">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform">
              <Calculator size={24} strokeWidth={1} />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-white/40 uppercase">Savings velocity</span>
              <p className="text-sm font-bold text-indigo-400 mt-1 uppercase">+15.2% Accel</p>
            </div>
          </div>
          <p className="text-4xl font-bold text-white tracking-tighter mb-4">$3,420.00 <span className="text-lg text-white/20">/mo</span></p>
          <p className="text-[10px] font-bold text-white/20 uppercase leading-none mt-auto">Aggregated assets</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-white/5 bg-gradient-to-br from-amber-500/[0.03] to-transparent relative overflow-hidden group">
          <div className="flex justify-between items-start mb-12">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-amber-400 group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} strokeWidth={1} />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-white/40 uppercase">Confidence rating</span>
              <p className="text-sm font-bold text-amber-400 mt-1 uppercase">Reliable Data</p>
            </div>
          </div>
          <p className="text-4xl font-bold text-white tracking-tighter mb-4">98.2%</p>
          <div className="flex gap-1.5 mt-auto">
             {[...Array(12)].map((_, i) => (
               <div key={i} className={`h-1.5 flex-1 rounded-sm ${i < 10 ? 'bg-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 'bg-white/5'}`} />
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-8">
          <section className="glass-panel p-5 sm:p-8 lg:p-10 rounded-2xl border border-white/5 bg-white/[0.01] relative overflow-visible">
            <div className="relative z-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-10 px-0 sm:px-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight uppercase">{t('analytics.liquidityProjection', 'Liquidity Projection')}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-bold text-white/30 uppercase">{t('analytics.liveDataFeed', 'Live Data Feed')}</span>
                  <div className="h-px w-10 bg-white/10" />
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 relative z-[200] w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none" ref={dropdownRef}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(prev => prev === 'type' ? null : 'type'); }}
                    className="flex items-center justify-between gap-3 px-4 py-3 bg-[#080808] border border-white/10 rounded-xl hover:border-white/30 transition-all w-full sm:min-w-[220px] shadow-2xl"
                  >
                    <span className="text-[11px] font-bold uppercase text-white/90 truncate">
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
                        className="absolute right-0 mt-3 w-full sm:w-64 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-[0_40px_80px_rgba(0,0,0,1)] z-[1100] py-3 overflow-hidden"
                      >
                        {chartOptions.map((opt) => (
                          <div 
                            key={opt.id}
                            onClick={(e) => { 
                              e.stopPropagation();
                              setChartType(opt.id); 
                              setIsDropdownOpen(null); 
                            }}
                            className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-all cursor-pointer ${chartType === opt.id ? 'bg-indigo-500 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                          >
                            <opt.icon size={16} strokeWidth={2} />
                            <span className="text-[11px] font-bold uppercase">{opt.name}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl text-white/30 hover:text-white transition-all shrink-0">
                  <Maximize2 size={16} />
                </button>
              </div>
            </div>

            {/* Chart area — explicit height required for ResponsiveContainer */}
            <div className="h-[280px] sm:h-[360px] lg:h-[460px] w-full relative z-10">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={chartType}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                  </ResponsiveContainer>
                </motion.div>
              </AnimatePresence>
            </div>
          </section>
        </div>

        <aside className="xl:col-span-4 space-y-10">
          <div className="glass-panel p-10 rounded-2xl border border-white/5 bg-[#0b0b0b]">
            <h3 className="text-[11px] font-bold text-white uppercase mb-12 pb-5 border-b border-white/5 flex justify-between items-center">
               {t('analytics.structuralDist', 'Structural Distribution')}
               <LayoutGrid size={14} className="text-white/20" />
            </h3>
            <div className="h-[320px]">
               <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData.trend}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }} />
                    <Radar name="Liquidity" dataKey="income" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.2} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
               </ResponsiveContainer>
            </div>
            <div className="space-y-6 mt-12">
               {chartData.categories.slice(0, 4).map((cat, i) => (
                 <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                       <span className="text-[10px] font-bold text-white/40 uppercase">{cat.name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-white uppercase tabular-nums">
                      {Math.round((cat.value / chartData.trend.reduce((a, b) => a + b.expenses, 0)) * 100)}%
                    </span>
                 </div>
               ))}
            </div>
          </div>

          <div className="glass-panel p-10 rounded-2xl border border-white/5 bg-[#0b0b0b]">
             <h3 className="text-[11px] font-bold text-white uppercase mb-10 flex items-center gap-4">
                <Globe size={16} className="text-indigo-400" />
                Regional insights
             </h3>
             <div className="space-y-6">
                <div>
                   <p className="text-[9px] font-bold text-white/30 uppercase mb-3 leading-none">Market Exposure</p>
                   <div className="flex items-end gap-1 h-12">
                      {[15, 25, 45, 30, 60, 40, 75, 50, 90].map((h, i) => (
                        <motion.div 
                          key={i} 
                          initial={{height: 0}}
                          animate={{height: `${h}%`}}
                          className="flex-1 bg-white/5 hover:bg-indigo-500/40 transition-colors" />
                      ))}
                   </div>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed font-medium uppercase opacity-60">
                   Real-time asset performance data synchronized across all operational sectors.
                </p>
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
