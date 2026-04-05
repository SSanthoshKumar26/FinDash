import { useMemo, useState, useRef, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, Line } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, PiggyBank, DollarSign, FileDown, Activity, Eye, Zap, Image as ImageIcon, FileText, AlertCircle, Loader2, ChevronDown, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import emailjs from '@emailjs/browser';

const MOTIVATIONAL_QUOTES = [
  { text: "The goal isn't more money. The goal is living life on your terms.", author: "Chris Brogan" },
  { text: "Do not save what is left after spending, but spend what is left after saving.", author: "Warren Buffett" },
  { text: "Financial freedom is available to those who learn about it and work for it.", author: "Robert Kiyosaki" },
  { text: "Investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "Price is what you pay. Value is what you get.", author: "Warren Buffett" },
  { text: "Rich people have small TVs and big libraries, and poor people have small libraries and big TVs.", author: "Zig Ziglar" },
  { text: "Beware of little expenses; a small leak will sink a great ship.", author: "Benjamin Franklin" }
];

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

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const exportAsImage = async (highRes = false) => {
    if (!dashboardRef.current || isExporting) return;
    setIsExporting(true);
    setExportMenuOpen(false);
    const toastId = toast.loading(t('dashboard.preparingExport', 'Initializing Safe-Mode Export...'));
    
    try {
      // 1. Wait for any pending frames/animations
      await new Promise(resolve => setTimeout(resolve, 800)); 
      
      const bgColor = theme === 'dark' ? '#050505' : '#f8fafc';
      const canvas = await html2canvas(dashboardRef.current, { 
        backgroundColor: bgColor, 
        scale: 2, 
        useCORS: true,
        allowTaint: true,
        logging: true,
        onclone: (clonedDoc) => {
          // 1. TOTAL SCRUB: String-replace every okl-color in the entire cloned document
          // This kills oklch in variables, styles, and attributes in one shot
          const scrub = (html) => html.replace(/(oklch|oklab|color-mix|calc)\([^)]+\)/g, 'rgb(128,128,128)');
          
          clonedDoc.head.innerHTML = scrub(clonedDoc.head.innerHTML);
          clonedDoc.body.innerHTML = scrub(clonedDoc.body.innerHTML);

          // 2. Structural Reinforcement
          // Remove all backdrop-filters and complex filters that crash the renderer
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach(el => {
            el.style.boxShadow = 'none';
            el.style.filter = 'none';
            el.style.backdropFilter = 'none';
            el.style.transition = 'none';
            el.style.animation = 'none';
            
            // Fix for Tailwind CSS v4 variables that might be undefined or complex
            if (el.style.backgroundColor && el.style.backgroundColor.includes('var')) {
               el.style.backgroundColor = bgColor === '#050505' ? '#111111' : '#ffffff';
            }

            if (el.classList.contains('glass-panel') || el.classList.contains('bg-panel')) {
              el.style.backgroundColor = bgColor === '#050505' ? '#111111' : '#ffffff';
            }
          });
          
          const svgs = clonedDoc.querySelectorAll('svg');
          svgs.forEach(svg => {
            const box = svg.getBoundingClientRect();
            if (box.width > 0) {
              svg.setAttribute('width', box.width.toString());
              svg.setAttribute('height', box.height.toString());
            }
          });
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.download = `findash_report_${timestamp}.png`;
      link.click();
      toast.success(t('dashboard.exportSuccess', 'Report Exported Successfully!'), { id: toastId });
    } catch (err) {
      console.error('Export Error:', err);
      toast.error(t('dashboard.exportError', 'Failed to export image'), { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
    if (!dashboardRef.current || isExporting) return;
    setIsExporting(true);
    setExportMenuOpen(false);
    const toastId = toast.loading(t('dashboard.preparingExport', 'Preparing High-Quality PDF...'));
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const bgColor = theme === 'dark' ? '#050505' : '#f8fafc';
      const canvas = await html2canvas(dashboardRef.current, { 
        backgroundColor: bgColor, 
        scale: 2, 
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          const scrub = (html) => html.replace(/(oklch|oklab|color-mix|calc)\([^)]+\)/g, 'rgb(128,128,128)');
          clonedDoc.head.innerHTML = scrub(clonedDoc.head.innerHTML);
          clonedDoc.body.innerHTML = scrub(clonedDoc.body.innerHTML);

          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach(el => {
             el.style.boxShadow = 'none';
             el.style.filter = 'none';
             el.style.backdropFilter = 'none';
             el.style.transition = 'none';
             el.style.animation = 'none';
             
             if (el.style.backgroundColor && el.style.backgroundColor.includes('var')) {
                el.style.backgroundColor = bgColor === '#050505' ? '#111111' : '#ffffff';
             }
             
             if (el.classList.contains('glass-panel')) {
               el.style.backgroundColor = bgColor === '#050505' ? '#111111' : '#ffffff';
             }
          });
        }
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      pdf.save(`findash_report_${timestamp}.pdf`);
      toast.success(t('dashboard.exportSuccess', 'Report Exported Successfully!'), { id: toastId });
    } catch (err) {
      console.error('PDF Export Error:', err);
      toast.error(t('dashboard.exportError', 'Failed to export PDF'), { id: toastId });
    } finally {
      setIsExporting(false);
    }
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

  const { balanceData, categoryData, totalIncome, totalExpenses, currentBalance, monthlyTrend, radarData, heatmapData } = useMemo(() => {
    let income = 0; let expenses = 0;
    const catMap = {}; const balTally = [];
    let runningBal = 25000;
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

    const radarData = [
      { subject: t('finance.stability', 'Stability'), A: 120, B: 110, fullMark: 150 },
      { subject: t('finance.growth', 'Growth'), A: 98, B: 130, fullMark: 150 },
      { subject: t('finance.liquidity', 'Liquidity'), A: 86, B: 130, fullMark: 150 },
      { subject: t('finance.risk', 'Risk'), A: 99, B: 100, fullMark: 150 },
      { subject: t('finance.yield', 'Yield'), A: 85, B: 90, fullMark: 150 },
      { subject: t('finance.diversification', 'Diversification'), A: 65, B: 85, fullMark: 150 },
    ];

    const heatmapData = Array.from({ length: 7 }, (_, i) => ({
      name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
      data: Array.from({ length: 24 }, (_, j) => ({ hour: j, value: Math.floor(Math.random() * 100) }))
    }));

    return { 
      balanceData: balTally, 
      categoryData: formattedCatData, 
      totalIncome: income, 
      totalExpenses: expenses, 
      currentBalance: runningBal, 
      monthlyTrend: formattedMonthly,
      radarData,
      heatmapData
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
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex flex-col items-center justify-center gap-6"
          >
            <div className="relative">
              <Loader2 className="animate-spin text-primary w-12 h-12" />
              <div className="absolute inset-x-0 -bottom-8 whitespace-nowrap text-xs font-bold tracking-widest text-primary text-center">
                {t('dashboard.exportingInProgress', 'SYNCING GLOBAL DOM...') }
              </div>
            </div>
            <div className="max-w-xs text-center space-y-2 px-8">
              <p className="text-white text-sm font-black uppercase tracking-tighter">{t('dashboard.protectingPixels', 'Capturing System State')}</p>
              <div className="h-1 bg-white/20 w-full rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={dashboardRef} className="space-y-8 min-h-full bg-background pb-8 text-primary">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div className="flex-1">
          <div id="dashboard-hero" className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center border border-border shadow-inner">
              <Activity className="text-primary" size={20} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-primary">{t('dashboard.systemDynamics', 'Financial Overview')}</h1>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{isAdmin ? 'Admin Terminal' : 'Viewer Mode'}</span>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                    <ShieldCheck size={10} className="text-indigo-500" />
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Protocol: Optimal</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center gap-6"
        >
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

      <div className="flex flex-col items-center justify-center text-center py-8 md:py-12 px-6 max-w-5xl mx-auto overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div 
            key={quoteIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="relative z-10"
          >
             <motion.span 
               initial={{ opacity: 0, letterSpacing: '1em', y: -20 }}
               animate={{ opacity: 1, letterSpacing: '0.4em', y: 0 }}
               transition={{ duration: 1.2, ease: "easeOut" }}
               className="text-[9px] font-black uppercase text-indigo-500 mb-6 block"
             >
               {t('dashboard.mindsetProtocol', 'Mindset Protocol')}
             </motion.span>
             
             <h2 className="text-xl md:text-3xl lg:text-4xl font-black text-primary leading-tight mb-8 italic tracking-tight max-w-3xl mx-auto">
               <div className="flex flex-wrap justify-center gap-x-[0.3em] gap-y-[0.1em]">
                 {t(`quotes.q${quoteIndex}`, MOTIVATIONAL_QUOTES[quoteIndex].text).split(' ').map((word, i) => (
                   <motion.span
                     key={`${quoteIndex}-${i}`}
                     initial={{ opacity: 0, y: 20, scale: 0.8, filter: 'blur(10px)' }}
                     animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                     transition={{ 
                       duration: 0.7, 
                       delay: i * 0.08,
                       ease: [0.2, 0.65, 0.3, 0.9]
                     }}
                     className="inline-block"
                   >
                     {i === 0 ? `"${word}` : i === t(`quotes.q${quoteIndex}`, MOTIVATIONAL_QUOTES[quoteIndex].text).split(' ').length - 1 ? `${word}"` : word}
                   </motion.span>
                 ))}
               </div>
             </h2>
             
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1, delay: 1 }}
               className="flex items-center justify-center gap-4"
             >
               <div className="h-px w-8 bg-gradient-to-r from-transparent to-indigo-500/30"></div>
               <p className="text-[10px] font-black text-primary/50 uppercase tracking-[0.3em]">
                 {MOTIVATIONAL_QUOTES[quoteIndex].author}
               </p>
               <div className="h-px w-8 bg-gradient-to-l from-transparent to-indigo-500/30"></div>
             </motion.div>
          </motion.div>
        </AnimatePresence>
        
        {/* Background Decorative Element */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none -z-0">
           <motion.div
             animate={{ 
               rotate: [12, 15, 12],
               scale: [1, 1.05, 1]
             }}
             transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
           >
              <Zap size={350} className="text-indigo-500" strokeWidth={0.5} />
           </motion.div>
        </div>
      </div>

      <div id="stat-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom duration-700 delay-200">
        <StatCard title={t('dashboard.capitalReservoir', 'Capital Reservoir')} amount={formatCurrency(currentBalance)} trend="+12.5%" trendUp={true} icon={DollarSign} colorClass="blue" isLive={true} />
        <StatCard title={t('dashboard.inflowVelocity', 'Inflow Velocity')} amount={formatCurrency(totalIncome)} trend="+8.2%" trendUp={true} icon={TrendingUp} colorClass="emerald" isLive={true} />
        <StatCard title={t('dashboard.burnCoefficient', 'Burn Coefficient')} amount={formatCurrency(totalExpenses)} trend="-2.4%" trendUp={false} icon={ArrowDownRight} colorClass="rose" isLive={true} />
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

        <div className="glass-panel p-6 flex flex-col min-h-[450px]">
          <h2 className="text-lg font-bold text-primary tracking-tight mb-8">{t('dashboard.riskRadar', 'Risk Matrix')}</h2>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="var(--border-color)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted-color)', fontSize: 8 }} />
                  <Radar name="Portfolio" dataKey="A" stroke="var(--primary-color)" fill="var(--primary-color)" fillOpacity={0.2} />
                  <Radar name="Benchmark" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
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
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] font-bold text-muted">Global Avg</span>
             </div>
          </div>
        </div>
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

        <div className="glass-panel p-6 min-h-[350px]">
           <h2 className="text-lg font-bold text-primary tracking-tight mb-8">{t('dashboard.burnVelocity', 'Burn Velocity')}</h2>
           <div className="h-44 w-full">
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
        </div>
      </div>

      <div className="glass-panel p-6 border border-border mt-6">
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
    </div>
  );
}
