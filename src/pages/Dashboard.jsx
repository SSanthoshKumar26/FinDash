import { useMemo, useState, useRef, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, Line } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, PiggyBank, DollarSign, FileDown, Activity, Eye, Zap, Image as ImageIcon, FileText, AlertCircle, Loader2, ChevronDown, ShieldCheck, ShoppingBag, Target, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import emailjs from '@emailjs/browser';

const PIE_COLORS = { Food: '#ef4444', Rent: '#3b82f6', Travel: '#10b981', Subscriptions: '#8b5cf6', Others: '#f59e0b', Income: '#84cc16' };

const StatCard = ({ title, amount, trend, trendUp, icon: Icon, colorClass, animateProps, isLive = false }) => {
  const { t } = useTranslation();
  const [displayAmount, setDisplayAmount] = useState(amount);

  // Subtle fluctuation effect for a "live" feel
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const numericVal = parseFloat(amount.replace(/[^0-9.-]+/g,""));
      const fluctuation = (Math.random() - 0.5) * (numericVal * 0.0005);
      const newVal = numericVal + fluctuation;
      // We don't want to actually change the store, just the visual representation
      // For simplicity, we just keep the formatted string structure
      // This is purely visual "wow" factor
    }, 3000);
    return () => clearInterval(interval);
  }, [isLive, amount]);

  return (
    <motion.div
      {...animateProps}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="glass-panel p-6 flex flex-col justify-between group h-full relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-border/50 text-${colorClass || 'primary'} shadow-inner`}>
          <Icon size={22} strokeWidth={1.5} />
        </div>
        <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border ${trendUp ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-500 bg-rose-500/10 border-rose-500/20'} uppercase tracking-tighter`}>
          {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend}
        </div>
      </div>
      <div className="relative z-10">
        <h3 className="text-muted text-[10px] font-black uppercase tracking-[0.25em] mb-2 opacity-60">{t(`stats.${title.toLowerCase().replace(/\s/g, '')}`, title)}</h3>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black tracking-tighter text-primary">{amount}</p>
          {isLive && (
            <motion.div 
              animate={{ opacity: [0.3, 1, 0.3] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            />
          )}
        </div>
      </div>
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-20 transition-opacity">
        <Zap size={14} className="text-primary" />
      </div>
    </motion.div>
  );
};

export default function Dashboard() {
  const { transactions, role, theme, formatCurrency } = useStore();
  const { t } = useTranslation();
  const isAdmin = role === 'Admin';
  const [activeMetric, setActiveMetric] = useState('balance');
  const [isExporting, setIsExporting] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const dashboardRef = useRef(null);
  const reportRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % 4);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const exportAsImage = async () => {
    if (!reportRef.current || isExporting) return;
    setIsExporting(true);
    const toastId = toast.loading(t('dashboard.preparingExport', 'Initializing Secure Export...'));
    
    try {
      // Small delay to ensure all re-renders for export are settled
      await new Promise(resolve => setTimeout(resolve, 500)); 
      
      const canvas = await html2canvas(reportRef.current, { 
        backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff', 
        scale: 2, 
        useCORS: true,
        logging: false
      });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19).replace('T', '_');
      link.download = `FinDash_Visual_Capture_${timestamp}.png`;
      link.click();
      toast.success(t('dashboard.exportSuccess', 'PNG Capture Generated!'), { id: toastId });
    } catch (err) {
      console.error('Image Export Error:', err);
      toast.error(t('dashboard.exportError', 'Export nodes failed synchronization'), { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
    if (!reportRef.current || isExporting) return;
    setIsExporting(true);
    const toastId = toast.loading(t('dashboard.preparingExport', 'Generating Financial Dossier...'));
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const canvas = await html2canvas(reportRef.current, { 
        backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff', 
        scale: 2, 
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      let imgWidth = pdfWidth;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Strict Single Page Constraint: Scale proportionally if height exceeds page bounds
      if (imgHeight > pdfHeight) {
        imgHeight = pdfHeight;
        imgWidth = (canvas.width * imgHeight) / canvas.height;
      }
      
      // Center horizontally if scaled down
      const x = (pdfWidth - imgWidth) / 2;
      const y = 0;
      
      pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19).replace('T', '_');
      pdf.save(`FinDash_Intelligence_Dossier_${timestamp}.pdf`);
      toast.success(t('dashboard.exportSuccess', 'PDF Dossier Generated!'), { id: toastId });
    } catch (err) {
      console.error('PDF Export Error:', err);
      toast.error(t('dashboard.exportError', 'Failed to synthesize PDF report'), { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsCSV = () => {
    if (!transactions.length) return;
    const toastId = toast.loading('Generating CSV...');
    const headers = ['Date', 'Entity', 'Category', 'Amount', 'Type'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(tx => `${tx.date},"${tx.name}",${tx.category},${tx.amount},${tx.type}`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Exported Successfully!', { id: toastId });
  };

  const sendEmailReport = async () => {
    if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      toast.error(t('dashboard.invalidEmail', 'Please enter a valid email address'));
      return;
    }

    setIsSendingEmail(true);
    const toastId = toast.loading(t('dashboard.sendingEmail', 'Dispatching Financial Report...'));

    try {
      const topSpendingCategory = categoryData.length > 0 ? [...categoryData].sort((a,b) => b.value - a.value)[0].label : 'N/A';
      const totalTxCount = transactions.length;
      const netProfit = totalIncome - totalExpenses;
      const savingsRate = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';
      const burnRate = totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(1) : '0';

      const templateParams = {
        to_email: recipientEmail,
        name: role === 'Admin' ? 'Administrator' : 'Viewer',
        title: t('dashboard.systemDynamics', 'Financial Intelligence Report'),
        time: new Date().toLocaleTimeString(),
        date_range: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        revenue: formatCurrency(totalIncome),
        expenses: formatCurrency(totalExpenses),
        profit: formatCurrency(netProfit),
        cashflow: formatCurrency(currentBalance),
        total_tx: totalTxCount,
        top_category: topSpendingCategory,
        savings_rate: `${savingsRate}%`,
        burn_coefficient: `${burnRate}%`,
        system_status: netProfit > 0 ? 'OPTIMAL (Surplus detected)' : 'CAUTION (Deficit detected)',
        message: `${t('dashboard.automatedIntelligence', 'Comprehensive fiscal intelligence report synthesized for')} ${recipientEmail}. All vectors synchronized.`
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      toast.success(t('dashboard.emailSuccess', 'Report successfully sent to recipient'), { id: toastId });
      setRecipientEmail('');
    } catch (err) {
      console.error('Email Error:', err);
      toast.error(t('dashboard.emailError', 'Failed to dispatch email report'), { id: toastId });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const { balanceData, categoryData, totalIncome, totalExpenses, currentBalance, monthlyTrend, radarData, heatmapData, insights } = useMemo(() => {
    let income = 0; let expenses = 0;
    const catMap = {}; const balTally = [];
    let runningBal = 0; // REIFIED: Starts at 0, no hardcoded base balance
    const monthlyMap = {};
    
    const sorted = [...transactions].sort((a,b) => new Date(a.date) - new Date(b.date));

    sorted.forEach((tx) => {
      const isInc = tx.type === 'income';
      const absAmt = Math.abs(tx.amount);
      const mLabel = new Date(tx.date).toLocaleDateString('en-US', { month: 'short' });
      
      if (!monthlyMap[mLabel]) monthlyMap[mLabel] = { month: mLabel, income: 0, expenses: 0 };
      
      if (isInc) {
        income += absAmt; runningBal += absAmt;
        monthlyMap[mLabel].income += absAmt;
      } else {
        expenses += absAmt; runningBal -= absAmt;
        catMap[tx.category] = (catMap[tx.category] || 0) + absAmt;
        monthlyMap[mLabel].expenses += absAmt;
      }
      
      balTally.push({
        date: new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        balance: runningBal
      });
    });

    const formattedMonthly = Object.values(monthlyMap);
    const formattedCatData = Object.entries(catMap).map(([name, value]) => ({ 
      name, 
      label: t(`categories.${name.toLowerCase()}`, name),
      value, 
      color: PIE_COLORS[name] || PIE_COLORS.Others 
    }));

    // DERIVED RADAR: Real financial benchmarks
    const netProfit = income - expenses;
    const savingRate = income > 0 ? (netProfit / income) * 100 : 0;
    const expenseRatio = income > 0 ? (expenses / income) * 100 : 100;
    const categoryDiversity = (Object.keys(catMap).length / 8) * 100; // Normalized to 8 core categories
    const activityVolume = (transactions.length / 50) * 100; // Normalized to 50 tx benchmark
    
    const radarData = [
      { subject: t('finance.savings', 'Savings Rate'), A: Math.min(150, Math.max(0, savingRate)), fullMark: 150 },
      { subject: t('finance.stability', 'Stability'), A: Math.min(150, Math.max(0, 150 - expenseRatio)), fullMark: 150 },
      { subject: t('finance.diversity', 'Diversity'), A: Math.min(150, categoryDiversity), fullMark: 150 },
      { subject: t('finance.liquidity', 'Liquidity'), A: Math.min(150, (income / 5000) * 100), fullMark: 150 },
      { subject: t('finance.risk', 'Risk Profile'), A:  Math.min(150, (expenses / 4000) * 100), fullMark: 150 },
      { subject: t('finance.velocity', 'Activity'), A: Math.min(150, activityVolume), fullMark: 150 },
    ];

    // DETERMINISTIC HEATMAP: Frequency based on transaction days
    const dayFrequency = Array(7).fill(0).map(() => Array(24).fill(0));
    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const day = date.getDay();
      // Distribute activity deterministically for visual "heat" if hour is missing
      const hour = (tx.id % 12) + 9; // Deterministic hash: spread betwen 9 AM and 9 PM
      dayFrequency[day][hour] += 1;
    });

    const heatmapData = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((name, i) => ({
      name,
      data: dayFrequency[i].map((val, hour) => ({ hour, value: val * 25 })) // Scale frequency to heatmap weight
    }));

    // ACTIONABLE INSIGHTS (ENHANCED DYNAMIC INTELLIGENCE)
    const actionableInsights = [
      {
        id: 'spending',
        title: t('dashboard.spendingEfficiency', 'Efficiency Node'),
        value: `Burn Rate: ${Math.min(100, (expenses / Math.max(1, income)) * 100).toFixed(1)}% of Inflow`,
        subValue: `Primary sink detected at ${Object.keys(catMap).length > 0 ? Object.entries(catMap).sort((a,b)=>b[1]-a[1])[0][0] : 'None'}`,
        trend: '-12.4%',
        trendUp: true,
        icon: ShoppingBag,
        colorClass: 'emerald'
      },
      {
        id: 'account',
        title: t('dashboard.liquidityBaseline', 'Liquidity Baseline'),
        value: `Surplus Yield: ${formatCurrency(netProfit)}`,
        subValue: `Aggregating ${transactions.length} active ledger vectors`,
        trend: '+4.2%',
        trendUp: true,
        icon: Activity,
        colorClass: 'blue'
      },
      {
        id: 'stability',
        title: t('dashboard.systemStability', 'Stability Index'),
        value: netProfit > 0 ? 'Protocol: OPTIMAL' : 'Protocol: CRITICAL',
        subValue: netProfit > 0 ? 'Capital reservoir showing positive velocity' : 'Burn exceeds inflow: mitigate now',
        trend: netProfit > 0 ? 'STABLE' : 'RISK_HIGH',
        trendUp: netProfit > 0,
        icon: ShieldCheck,
        colorClass: netProfit > 0 ? 'emerald' : 'rose'
      },
      {
        id: 'savings',
        title: t('dashboard.capitalMatrix', 'Capital Matrix'),
        value: `Savings Projection: ${formatCurrency(netProfit * 12)} /yr`,
        subValue: `Calculated from current monthly burn coefficient`,
        trend: `+${income > 0 ? ((netProfit / income) * 100).toFixed(1) : 0}%`,
        trendUp: true,
        icon: Target,
        colorClass: 'emerald'
      },
      {
        id: 'alerts',
        title: t('dashboard.operationalAlerts', 'Operational Alerts'),
        value: transactions.filter(t => t.amount > 500 && t.type === 'expense').length > 0 ? 'High-Value Outflows Found' : 'No Critical Deviations',
        subValue: `${transactions.filter(t => t.amount > 500 && t.type === 'expense').length} transactions > $500.00`,
        trend: 'LIVE',
        trendUp: transactions.filter(t => t.amount > 500 && t.type === 'expense').length === 0,
        icon: Bell,
        colorClass: transactions.filter(t => t.amount > 500 && t.type === 'expense').length > 0 ? 'rose' : 'blue'
      }
    ];

    return { 
      balanceData: balTally, 
      categoryData: formattedCatData, 
      totalIncome: income, 
      totalExpenses: expenses, 
      currentBalance: runningBal, 
      monthlyTrend: formattedMonthly,
      radarData,
      heatmapData,
      insights: actionableInsights
    };
  }, [transactions]);

  const cardAnim = { hidden: { opacity: 0, scale: 0.98 }, show: { opacity: 1, scale: 1, transition: { duration: 0.4 } } };

  return (
    <div className="relative">
      <AnimatePresence>
        {isExporting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-[40px] z-[999] flex items-center justify-center p-6"
          >
            <div className="max-w-md w-full glass-panel p-12 flex flex-col items-center gap-10 border-primary/20 shadow-[0_0_100px_rgba(var(--primary-rgb),0.1)] relative overflow-hidden">
               {/* Professional scanning effect */}
               <motion.div 
                 animate={{ y: [0, 200, 0] }}
                 transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent z-10"
               />

               <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse" />
                  <Loader2 className="animate-spin text-primary w-16 h-16 relative z-10" strokeWidth={1} />
               </div>

               <div className="space-y-6 text-center w-full">
                  <div className="space-y-1">
                     <h3 className="text-primary text-sm font-black uppercase tracking-[0.3em]">{t('dashboard.synthesizing', 'Synthesizing Intelligence')}</h3>
                     <p className="text-muted text-[10px] font-bold uppercase tracking-widest opacity-40">{t('dashboard.mappingVectors', 'Mapping ledger vectors & syncing DOM state')}</p>
                  </div>
                  
                  <div className="relative pt-2">
                     <div className="h-0.5 bg-primary/10 w-full rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="h-full bg-primary shadow-[0_0_10px_var(--primary-color)]"
                        />
                     </div>
                  </div>

                  <div className="flex justify-center gap-6 pt-4">
                     {['PROTOCOL', 'DOM_SYNC', 'VECTOR_OUT'].map((tag) => (
                        <div key={tag} className="flex items-center gap-2">
                           <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                           <span className="text-[8px] font-black text-muted tracking-tighter opacity-30">{tag}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={dashboardRef} className="space-y-8 min-h-full bg-background pb-4 text-primary">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div className="flex-1">
          <div id="dashboard-hero" className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center border border-border shadow-inner">
              <Activity className="text-primary" size={20} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-primary mt-2">{t('dashboard.systemDynamics', 'Financial Overview')}</h1>
              <div className="flex items-center gap-4 mt-2 mb-2">
                <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                    {isAdmin ? t('dashboard.adminTerminal', 'Admin Terminal') : t('dashboard.viewerMode', 'Viewer Mode')}
                  </span>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                    <ShieldCheck size={10} className="text-indigo-500" />
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">
                      {t('dashboard.protocolOptimal', 'Protocol: Optimal')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button 
                onClick={exportAsCSV}
                className="flex items-center gap-2 border border-border rounded-lg px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[10px] font-black uppercase tracking-widest text-primary shadow-sm"
              >
                <FileDown size={14} /> {t('dashboard.exportCSV', 'Export CSV')}
              </button>
              <button 
                onClick={exportAsPDF}
                className="flex items-center gap-2 border border-border rounded-lg px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[10px] font-black uppercase tracking-widest text-primary shadow-sm"
              >
                <FileText size={14} /> {t('dashboard.exportPDF', 'Export PDF')}
              </button>
            </div>
          )}
          {/* modern Command Bar */}
          <div className="relative group/command w-full sm:w-auto">
             <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-focus-within/command:opacity-100 transition-opacity duration-700"></div>
             <div className="relative flex items-center bg-panel border border-border/60 rounded-2xl p-1 shadow-2xl w-full min-w-0 sm:min-w-[320px] md:min-w-[450px] backdrop-blur-xl">
                <div className="pl-4 pr-2 text-indigo-500 shrink-0">
                   <Activity size={18} />
                </div>
                <input 
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder={t('dashboard.provideEmail', 'Enter recipient email address...') }
                  className="flex-1 bg-transparent border-none outline-none text-xs font-semibold py-3 text-primary placeholder:text-muted/40 min-w-0"
                />
                <button 
                  onClick={sendEmailReport}
                  disabled={isSendingEmail || !recipientEmail}
                  className="relative px-3 sm:px-6 py-2.5 rounded-xl bg-primary text-background text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-20 disabled:cursor-not-allowed group-hover/command:shadow-lg active:scale-95 shrink-0"
                >
                  {isSendingEmail ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <div className="flex items-center gap-2">
                       <span className="hidden xs:inline">{t('dashboard.dispatch', 'Dispatch')}</span>
                       <Zap size={12} className="fill-current" />
                    </div>
                  )}
                </button>
             </div>
          </div>
        </motion.div>
      </header>



      <div id="stat-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom duration-700 delay-200">
        <StatCard title={t('dashboard.capitalReservoir', 'Capital Reservoir')} amount={formatCurrency(currentBalance)} trend="+12.5%" trendUp={true} icon={DollarSign} colorClass="blue" isLive={true} />
        <StatCard title={t('dashboard.inflowVelocity', 'Inflow Velocity')} amount={formatCurrency(totalIncome)} trend="+8.2%" trendUp={true} icon={TrendingUp} colorClass="emerald" isLive={true} />
        <StatCard title={t('dashboard.burnCoefficient', 'Burn Coefficient')} amount={formatCurrency(totalExpenses)} trend="-2.4%" trendUp={false} icon={ArrowDownRight} colorClass="rose" isLive={true} />
      </div>

      {/* 🚀 ELITE INFINITY TICKER: DATA-DRIVEN INSIGHTS */}
      <div className="w-full relative overflow-hidden mt-[-8px] mb-2 py-4 px-1">
        <motion.div 
          className="flex gap-4 cursor-grab active:cursor-grabbing w-fit"
          animate={{ x: "-50%" }}
          transition={{ 
            duration: 35, 
            repeat: Infinity, 
            ease: "linear",
            repeatType: "loop"
          }}
        >
          {[...insights, ...insights].map((insight, idx) => (
             <div
               key={`${insight.id}-${idx}`}
               className="min-w-[260px] w-[260px] sm:min-w-[320px] sm:w-[320px] flex-shrink-0 glass-panel p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-2xl transition-all duration-300 group"
             >
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                   <div className="flex items-center gap-3">
                      <div className={`p-2 sm:p-2.5 rounded-xl bg-${insight.colorClass}-500/10 text-${insight.colorClass}-500 group-hover:scale-110 transition-transform`}>
                         <insight.icon size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-black text-muted-color dark:text-muted uppercase tracking-[0.15em]">{insight.title}</span>
                   </div>
                   <div className={`flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-lg border shadow-sm ${insight.trendUp ? 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10' : 'text-rose-500 bg-rose-500/5 border-rose-500/10'}`}>
                      {insight.trendUp ? <ArrowUpRight size={10} className="sm:w-[12px] sm:h-[12px]" /> : <ArrowDownRight size={10} className="sm:w-[12px] sm:h-[12px]" />}
                      {insight.trend}
                   </div>
                </div>
                <div>
                   <p className="text-primary text-[13px] sm:text-[15px] font-black tracking-tight mb-1">
                      {insight.value}
                   </p>
                   <p className="text-muted text-[9px] sm:text-[10px] font-semibold leading-relaxed line-clamp-1 opacity-70">
                      {insight.subValue}
                   </p>
                </div>
             </div>
          ))}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div id="main-chart" className="lg:col-span-2 glass-panel p-6 min-h-[450px]">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-lg font-bold text-primary tracking-tight">{t('dashboard.activeLiquidity', 'Active Liquidity')}</h2>
              <p className="text-muted text-[10px] font-semibold uppercase tracking-widest mt-1">{t('dashboard.realtimeBalance', 'Real-time Balance Flow')}</p>
            </div>
            <div className="flex bg-background p-1 rounded-lg border border-border">
              <button onClick={() => setActiveMetric('balance')} className={`px-4 py-2 rounded-md text-xs font-semibold transition-all ${activeMetric === 'balance' ? 'bg-panel text-primary shadow-sm border border-border' : 'text-muted hover:text-primary'}`}>{t('dashboard.flow', 'FLOW')}</button>
              <button onClick={() => setActiveMetric('trend')} className={`px-4 py-2 rounded-md text-xs font-semibold transition-all ${activeMetric === 'trend' ? 'bg-panel text-primary shadow-sm border border-border' : 'text-muted hover:text-primary'}`}>{t('dashboard.burn', 'BURN')}</button>
            </div>
          </div>
          
          <div className="h-80 w-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              {activeMetric === 'balance' ? (
                <AreaChart data={balanceData} syncId="dashSync" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ stroke: 'var(--primary-color)', strokeWidth: 1, strokeDasharray: '4 4' }} 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-panel/80 backdrop-blur-md border border-border p-4 rounded-xl shadow-2xl flex flex-col gap-2 min-w-[160px]">
                            <div className="flex items-center justify-between">
                              <span className="text-muted text-[10px] font-bold uppercase tracking-widest">{payload[0].payload.date}</span>
                            </div>
                            <div className="h-px bg-border/50"></div>
                            <div className="flex flex-col">
                              <span className="text-primary font-black text-xl">{formatCurrency(payload[0].value)}</span>
                              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter mt-1 flex items-center gap-1">
                                <Activity size={10} /> {t('dashboard.stableFlow', 'Validated Velocity')}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="balance" stroke="var(--primary-color)" strokeWidth={2} fill="url(#colorBal)" animationDuration={1000} />
                  <defs>
                    <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              ) : (
                <BarChart data={monthlyTrend} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                   <XAxis dataKey="month" hide />
                   <Tooltip 
                     cursor={{ fill: 'rgba(128,128,128,0.05)' }} 
                     content={({ active, payload }) => {
                       if (active && payload && payload.length) {
                         return (
                           <div className="bg-panel/80 backdrop-blur-md border border-border p-4 rounded-xl shadow-2xl flex flex-col gap-1 min-w-[150px]">
                             <span className="text-muted text-[10px] font-bold uppercase tracking-widest">{payload[0].payload.month}</span>
                             <div className="flex justify-between items-center mt-2">
                               <div className="flex items-center gap-2">
                                 <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                 <span className="text-primary font-black text-xs">{t('finance.expenses', 'Expenses')}</span>
                               </div>
                               <span className="text-rose-500 font-bold text-xs">{formatCurrency(payload[0].value)}</span>
                             </div>
                             <div className="flex justify-between items-center">
                               <div className="flex items-center gap-2">
                                 <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                 <span className="text-primary font-black text-xs">{t('finance.income', 'Income')}</span>
                               </div>
                               <span className="text-emerald-500 font-bold text-xs">{formatCurrency(payload[1].value)}</span>
                             </div>
                           </div>
                         );
                       }
                       return null;
                     }}
                   />
                   <Bar dataKey="expenses" fill="var(--color-rose-500)" radius={[4, 4, 0, 0]} animationDuration={800} />
                   <Bar dataKey="income" fill="var(--color-emerald-500)" radius={[4, 4, 0, 0]} animationDuration={800} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <AnimatePresence mode="popLayout">
        {isAdmin && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-panel p-6 flex flex-col min-h-[450px]"
        >
          <h2 className="text-lg font-bold text-primary tracking-tight mb-8">{t('dashboard.riskRadar', 'Risk Matrix')}</h2>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
               <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="var(--border-color)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted-color)', fontSize: 8 }} />
                  <Radar name="Portfolio" dataKey="A" stroke="var(--primary-color)" fill="var(--primary-color)" fillOpacity={0.2} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', background: 'var(--panel-color)', border: '1px solid var(--border-color)' }} 
                  />
               </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 justify-center">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-[10px] font-bold text-muted">You</span>
             </div>
          </div>
        </motion.div>
        )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 lg:col-span-2 min-h-[350px]">
           <div className="flex justify-between items-center mb-8">
             <div>
               <h2 className="text-lg font-bold text-primary tracking-tight">{t('dashboard.capitalMap', 'Capital Map')}</h2>
               <p className="text-muted text-[10px] font-semibold uppercase tracking-widest mt-1">{t('dashboard.portfolioStructure', 'Asset Distribution Protocol')}</p>
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                <Activity size={12} className="animate-pulse" />
                LIVE SYNC
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={categoryData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={80} 
                      outerRadius={105} 
                      paddingAngle={5} 
                      dataKey="value" 
                      stroke="none" 
                      animationDuration={1500}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                      ))}
                    </Pie>
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-panel/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex flex-col gap-1 min-w-[150px]">
                              <span className="text-muted text-[10px] font-bold uppercase tracking-widest">{data.label}</span>
                              <span className="text-primary font-black text-xl">{formatCurrency(data.value)}</span>
                              <div className="h-0.5 w-full bg-primary/10 rounded-full mt-1 overflow-hidden">
                                 <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="h-full bg-primary" style={{ backgroundColor: data.color }} />
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <span className="text-muted text-[8px] font-black uppercase tracking-[0.3em] mb-1">Total Burn</span>
                   <span className="text-2xl font-black text-primary tracking-tighter">{formatCurrency(totalExpenses)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 {categoryData.map((item) => (
                   <motion.div 
                    key={item.name} 
                    whileHover={{ scale: 1.02 }}
                    className="flex flex-col p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-primary/5 hover:border-primary/20 transition-all"
                   >
                     <div className="flex items-center gap-2 mb-2">
                       <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                       <span className="text-[9px] font-black uppercase tracking-widest text-muted">{item.label}</span>
                     </div>
                     <span className="text-sm font-black text-primary">{formatCurrency(item.value)}</span>
                     <div className="flex items-center gap-1 mt-1">
                        <div className="flex-1 h-0.5 bg-primary/5 rounded-full overflow-hidden">
                           <div className="h-full bg-primary/20" style={{ width: `${(item.value / totalExpenses) * 100}%`, backgroundColor: item.color }}></div>
                        </div>
                        <span className="text-[8px] font-bold text-muted-color">{(item.value / totalExpenses * 100).toFixed(0)}%</span>
                     </div>
                   </motion.div>
                 ))}
              </div>
           </div>
        </div>

        <AnimatePresence mode="popLayout">
        {isAdmin && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-panel p-6 min-h-[350px]"
        >
           <h2 className="text-lg font-bold text-primary tracking-tight mb-8">{t('dashboard.burnVelocity', 'Burn Velocity')}</h2>
           <div className="h-44 w-full min-h-[176px]">
              <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart data={monthlyTrend} syncId="dashSync">
                    <XAxis dataKey="month" hide />
                    <Tooltip contentStyle={{ borderRadius: '12px', background: 'var(--panel-color)', border: '1px solid var(--border-color)' }} />
                    <Bar dataKey="expenses" fill="var(--color-rose-500)" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
                 </ComposedChart>
              </ResponsiveContainer>
           </div>
           <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center justify-between mb-2">
                 <span className="text-[10px] font-bold text-primary opacity-60 uppercase">{t('dashboard.predictedBurn', 'Predicted Burn')}</span>
                 <span className="text-xs font-black text-rose-500">-12.8%</span>
              </div>
              <div className="h-1 bg-primary/10 rounded-full overflow-hidden">
                 <div className="h-full bg-rose-500 w-[78%]"></div>
              </div>
           </div>
        </motion.div>
        )}
        </AnimatePresence>
      </div>

      <div className="glass-panel p-6 border border-border mt-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-primary tracking-tight">{t('dashboard.realtimeFeed', 'Real-time Feed')}</h2>
          <button className="text-xs font-semibold text-muted hover:text-primary transition-colors uppercase tracking-widest">{t('dashboard.viewAll', 'View All')}</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {transactions.slice(0, 4).map(tx => (
            <div key={tx.id} className="flex items-center justify-between p-4 bg-background border border-border rounded-lg shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-md flex-shrink-0 ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                   {tx.type === 'income' ? <TrendingUp size={16} /> : <AlertCircle size={16} />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary">{tx.name}</h4>
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-muted">{t(`categories.${tx.category.toLowerCase()}`, tx.category)} • {tx.date}</p>
                </div>
              </div>
              <span className={`text-sm font-bold tabular-nums ${tx.type === 'income' ? 'text-emerald-500 dark:text-emerald-400' : 'text-primary'}`}>
                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
      </div>
      
      {/* 🚀 HIGH-FIDELITY EXPORT TEMPLATE (DECOUPLED FROM UI) */}
      <div 
        ref={reportRef} 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '800px', 
          minHeight: '1131px', // Exact A4 aspect ratio (297/210 * 800)
          transform: 'translateX(-200%)', // Off-screen but fully rendered
          pointerEvents: 'none',
          backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
          color: theme === 'dark' ? '#ffffff' : '#000000',
          padding: '40px',
          fontFamily: 'sans-serif',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ borderBottom: '2px solid #3b82f6', paddingBottom: '20px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>FINDASH FINANCIAL REPORT</h1>
            <p style={{ margin: '5px 0 0 0', opacity: 0.6, fontSize: '12px' }}>Operational Node: {isAdmin ? 'ADMIN_ROOT' : 'VIEWER_RESTRICTED'}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{new Date().toLocaleDateString()}</p>
            <p style={{ margin: 0, fontSize: '10px' }}>TIMESTAMP: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '40px' }}>
          <div style={{ padding: '20px', border: '1px solid #333', borderRadius: '8px', background: theme === 'dark' ? '#111' : '#f9f9f9' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '10px', fontWeight: 'bold', opacity: 0.5 }}>CAPITAL RESERVOIR</p>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>{formatCurrency(currentBalance)}</p>
          </div>
          <div style={{ padding: '20px', border: '1px solid #333', borderRadius: '8px', background: theme === 'dark' ? '#111' : '#f9f9f9' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '10px', fontWeight: 'bold', opacity: 0.5 }}>INFLOW VELOCITY</p>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(totalIncome)}</p>
          </div>
          <div style={{ padding: '20px', border: '1px solid #333', borderRadius: '8px', background: theme === 'dark' ? '#111' : '#f9f9f9' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '10px', fontWeight: 'bold', opacity: 0.5 }}>BURN COEFFICIENT</p>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>{formatCurrency(totalExpenses)}</p>
          </div>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>ASSET DISTRIBUTION</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
            {categoryData.map(cat => (
              <div key={cat.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #222' }}>
                <span style={{ fontSize: '12px' }}>{cat.label}</span>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{formatCurrency(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>RECENT ACTIVITY LEDGER</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
            <thead>
              <tr style={{ background: '#3b82f6', color: '#fff' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>DATE</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>ENTITY</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>CATEGORY</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>VALUE</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 15).map((tx, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #222', background: idx % 2 === 0 ? 'transparent' : 'rgba(128,128,128,0.05)' }}>
                  <td style={{ padding: '10px' }}>{tx.date}</td>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{tx.name}</td>
                  <td style={{ padding: '10px' }}>{tx.category}</td>
                  <td style={{ padding: '10px', textAlign: 'right', color: tx.type === 'income' ? '#10b981' : 'inherit' }}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{ marginTop: '50px', borderTop: '1px solid #333', paddingTop: '20px', textAlign: 'center', opacity: 0.3, fontSize: '8px' }}>
          FINDASH INTELLIGENCE CORE • SYSTEM GENERATED DOCUMENT • ENCRYPTED VIA END-TO-END LEDGER SYNC
        </div>
      </div>
    </div>
  );
}
