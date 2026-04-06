import { motion } from 'framer-motion';
import { 
  Shield, Activity, Send, Wallet, PieChart, 
  Landmark, FileCheck, LandmarkIcon, ClipboardList,
  Zap, Globe, Database, Lock as LockIcon, BarChart3, Bell,
  Cpu, Workflow, Fingerprint, Layers
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Premium transition for a "smooth professional" feel
const SMOOTH_TRANSITION = {
  duration: 0.8,
  ease: [0.22, 1, 0.36, 1]
};

// Explicit color mapping to ensure Tailwind classes are never purged
const THEMES = {
  indigo: {
    bg: 'bg-indigo-500',
    text: 'text-indigo-500',
    border: 'border-indigo-500',
    glow: 'shadow-[0_0_10px_rgba(79,70,229,0.4)]',
    lightBg: 'bg-indigo-500/10',
    lightBorder: 'border-indigo-500/10'
  },
  emerald: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-500',
    border: 'border-emerald-500',
    glow: 'shadow-[0_0_10px_rgba(16,185,129,0.4)]',
    lightBg: 'bg-emerald-500/10',
    lightBorder: 'border-emerald-500/10'
  },
  blue: {
    bg: 'bg-blue-500',
    text: 'text-blue-500',
    border: 'border-blue-500',
    glow: 'shadow-[0_0_10px_rgba(59,130,246,0.4)]',
    lightBg: 'bg-blue-500/10',
    lightBorder: 'border-blue-500/10'
  }
};

const ProtocolStep = ({ index, title, instruction, isLast, color }) => {
  const theme = THEMES[color] || THEMES.indigo;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={SMOOTH_TRANSITION}
      className="relative flex items-start gap-10 mb-12 group"
    >
      {/* Connection Line */}
      {!isLast && (
        <motion.div 
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }}
          className="absolute left-[13px] top-7 w-[1px] h-[calc(100%+3rem)] bg-gradient-to-b from-border to-transparent origin-top"
        />
      )}
      
      {/* Step Node - Enlarged and made more visible */}
      <div className={`relative z-10 flex-shrink-0 flex items-center justify-center w-[28px] h-[28px] rounded-full bg-panel border border-border shadow-sm group-hover:border-${color}-500/50 transition-all duration-300`}>
        <motion.div 
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ ...SMOOTH_TRANSITION, delay: 0.1 }}
          className={`w-2.5 h-2.5 rounded-full ${theme.bg} ${theme.glow} group-hover:scale-125 transition-transform`} 
        />
      </div>

      {/* Content Area */}
      <div className="flex-grow pt-0.5">
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ ...SMOOTH_TRANSITION, delay: 0.2 }}
        >
          <h4 className="text-lg font-bold text-primary tracking-tight mb-2 flex items-center gap-3">
            <span className={`text-[10px] font-black tabular-nums tracking-widest ${theme.text} opacity-60`}>0{index + 1}</span>
            {title}
          </h4>
          <p className="text-muted leading-relaxed max-w-2xl text-[14px] font-medium opacity-80 group-hover:opacity-100 transition-opacity">
            {instruction}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

const ModuleSection = ({ number, title, icon: Icon, steps, color, translationKey }) => {
  const theme = THEMES[color] || THEMES.indigo;
  const { t } = useTranslation();
  
  return (
    <div className="relative py-16">
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Left: Section Identity */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={SMOOTH_TRANSITION}
          className="lg:w-1/3"
        >
          <motion.div 
             whileHover={{ scale: 1.05 }}
             className={`w-14 h-14 rounded-2xl ${theme.lightBg} ${theme.text} flex items-center justify-center border ${theme.lightBorder} mb-8`}
          >
            <Icon size={28} strokeWidth={1.5} />
          </motion.div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme.text}`}>{t('protocols.operation', 'Operation')} {number}</span>
               <div className={`h-px w-8 ${theme.bg} opacity-20`} />
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-primary tracking-tight leading-tight uppercase">{t(`protocols.${translationKey}.title`, title)}</h2>
            <div className="h-1 w-12 rounded-full bg-border" />
          </div>
        </motion.div>

        {/* Right: Flow */}
        <div className="lg:w-2/3">
          {steps.map((step, i) => (
            <ProtocolStep 
              key={i} 
              index={i} 
              title={t(`protocols.${translationKey}.step${i+1}Title`, step.title)}
              instruction={t(`protocols.${translationKey}.step${i+1}Desc`, step.instruction)}
              color={color}
              isLast={i === steps.length - 1} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default function Protocols() {
  const { t } = useTranslation();

  const protocols = [
    {
      number: "I",
      translationKey: "layerSync",
      title: "Data Layer Synchronizer",
      icon: Database,
      color: "indigo",
      steps: [
        { title: "Bank Gateway Authentication", instruction: "Secure validation via OAuth 2.0 and API synchronization with global financial entities for real-time ledger updates." },
        { title: "Unified Schema Normalization", instruction: "Converting disparate multi-source transaction data into a standardized JSON format for cross-platform processing." },
        { title: "Asset Liquidity Indexing", instruction: "Historical indexing of all holdings to generate predictive heatmaps and volatility scores for precision tracking." }
      ]
    },
    {
      number: "II",
      translationKey: "riskEngine",
      title: "Risk Engine Protocols",
      icon: Shield,
      color: "emerald",
      steps: [
        { title: "Anomaly Vector Detection", instruction: "Scanning every outbound transaction against 50+ threat vectors to identify frequency outliers and volume spikes." },
        { title: "Burn Trajectory Analysis", instruction: "Computing daily expenditure velocity versus total capital reservoir using recursive forecasting models." },
        { title: "Portfolio Parity Audit", instruction: "Ensuring current asset distribution remains within defined risk-tolerance thresholds across all sectors." }
      ]
    },
    {
      number: "III",
      translationKey: "intelDispatch",
      title: "Intelligence Dispatch",
      icon: Send,
      color: "blue",
      steps: [
        { title: "Access Node Security", instruction: "Provisioning granular node-level permissions for executive stakeholders and authorized institutional observers." },
        { title: "Summarization Pipeline", instruction: "Transforming raw financial cycles into high-density executive briefs through our proprietary distillation engine." },
        { title: "Encrypted Link Delivery", instruction: "Secure transmission of performance reports using time-limited, multi-factor authenticated verification links." }
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24">
      
      {/* Refined Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SMOOTH_TRANSITION}
        className="relative mb-24 pb-16 border-b border-border"
      >
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-[60px]" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-black text-primary tracking-tight uppercase leading-none">
              {t('protocols.operational', 'Operational')} <span className="text-indigo-500 opacity-60">{t('protocols.protocolsTitle', 'Protocols')}</span>
            </h1>
            <p className="max-w-xl text-[15px] text-muted font-medium leading-relaxed">
              {t('protocols.desc', 'Standardized financial procedures for data integrity, risk mitigation, and reporting. Optimized for enterprise-grade dashboard performance and security.')}
            </p>
          </div>
        </div>
      </motion.header>

      {/* Modern Flow Sections */}
      <main className="divide-y divide-border/50">
        {protocols.map((protocol, idx) => (
          <ModuleSection key={idx} {...protocol} />
        ))}
      </main>

      {/* Refined Resources */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={SMOOTH_TRANSITION}
        className="mt-24 pt-16 border-t border-border"
      >
        <div className="mb-12">
          <h3 className="text-xl font-black text-primary tracking-tight uppercase mb-2">{t('protocols.techDoc', 'Technical Documentation')}</h3>
          <p className="text-sm text-muted font-medium opacity-80 uppercase tracking-widest">{t('protocols.resourceNodes', 'Extended resource nodes')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Workflow, color: "indigo", title: t('protocols.doc1Title', 'Ledger Specs'), desc: t('protocols.doc1Desc', 'Detailed technical schema of financial vector categorization.') },
            { icon: Fingerprint, color: "emerald", title: t('protocols.doc2Title', 'Audit Protocols'), desc: t('protocols.doc2Desc', 'Security standards for cross-border transaction verification.') },
            { icon: Layers, color: "blue", title: t('protocols.doc3Title', 'API Core Ref'), desc: t('protocols.doc3Desc', 'Documentation for automated reporting hooks and node integration.') }
          ].map((item, i) => {
            const theme = THEMES[item.color] || THEMES.indigo;
            return (
              <motion.div 
                key={i}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...SMOOTH_TRANSITION, delay: i * 0.1 }}
                className="glass-panel p-6 rounded-2xl border border-border/50 bg-panel group cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-xl ${theme.lightBg} ${theme.text} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner`}>
                  <item.icon size={20} strokeWidth={1.5} />
                </div>
                <h4 className="text-sm font-bold text-primary tracking-tight uppercase mb-2">{item.title}</h4>
                <p className="text-[13px] text-muted leading-relaxed font-medium opacity-80">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>
    </div>
  );
}
