import { motion } from 'framer-motion';
import { Activity, AlertCircle, Zap, Globe, ExternalLink, TrendingUp, Newspaper, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LIVE_FEEDS = [
  {
    source: 'Reuters Business',
    title: 'Global markets stabilize as inflation concerns ease slightly in Q1 reports',
    link: 'https://www.reuters.com/business/',
    category: 'Markets',
    time: '2 mins ago'
  },
  {
    source: 'Bloomberg',
    title: 'Bank of England maintains current interest rates amid mixed labor market data',
    link: 'https://www.bloomberg.com/markets',
    category: 'Banking',
    time: '15 mins ago'
  },
  {
    source: 'CNBC Finance',
    title: 'New tech IPOs show strong residue of investor confidence in early trading',
    link: 'https://www.cnbc.com/finance/',
    category: 'Technology',
    time: '42 mins ago'
  },
  {
    source: 'Financial Times',
    title: 'Energy conglomerates pivot towards long-term sustainable infrastructure yields',
    link: 'https://www.ft.com/',
    category: 'ESG',
    time: '1 hour ago'
  },
  {
    source: 'Wall Street Journal',
    title: 'Real estate sectors in major hubs see shift towards hybrid-usage portfolios',
    link: 'https://www.wsj.com/news/markets',
    category: 'Real Estate',
    time: '3 hours ago'
  }
];

export default function Insights() {
  const { t } = useTranslation();
  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20 max-w-[1400px] mx-auto px-4 sm:px-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-primary/5 rounded-lg border border-border">
                <Globe size={20} className="text-primary" />
             </div>
             <h1 className="text-3xl font-black tracking-tight text-primary uppercase">{t('insights.title', 'Intelligence Portal')}</h1>
           </div>
           <p className="text-muted text-[10px] font-bold uppercase tracking-[0.3em] opacity-60">{t('insights.subtitle', 'Global Institutional Insights & Strategic Data')}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Feed Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between border-b border-border pb-4">
             <div className="flex items-center gap-4">
                <Newspaper size={18} className="text-primary/40" />
                <h2 className="text-sm font-black uppercase tracking-widest text-primary">{t('insights.liveFeed', 'Live Institutional Feed')}</h2>
             </div>
             <span className="text-[9px] font-bold text-muted uppercase">{t('insights.sources', 'Sources: Global Top 5')}</span>
          </div>

          <div className="space-y-6">
            {LIVE_FEEDS.map((item, idx) => (
              <motion.a
                key={idx}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group block p-6 rounded-2xl border border-border bg-panel hover:bg-primary/[0.02] hover:border-primary/20 transition-all shadow-sm hover:shadow-xl"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none block">{t(`insights.feed${idx}.source`, item.source)}</span>
                    <div className="flex items-center gap-2">
                       <Clock size={10} className="text-muted" />
                       <span className="text-[9px] font-bold text-muted uppercase tracking-tighter">{t(`insights.feed${idx}.time`, item.time)}</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink size={14} className="text-primary" />
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-primary group-hover:text-indigo-500 transition-colors leading-tight mb-4 pr-10">
                  {t(`insights.feed${idx}.title`, item.title)}
                </h3>
                
                <div className="flex items-center gap-3">
                   <span className="px-2.5 py-1 rounded-md bg-primary/5 text-primary text-[8px] font-black uppercase tracking-widest border border-border">
                      {t(`categories.${item.category.toLowerCase().replace(/\s/g, '')}`, item.category)}
                   </span>
                   <div className="h-px flex-1 bg-border/40" />
                </div>
              </motion.a>
            ))}
          </div>
        </div>

                <aside className="space-y-10">
          <div className="glass-panel p-8 rounded-2xl border border-border bg-gradient-to-br from-primary/[0.02] to-transparent">
             <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
                   <TrendingUp size={20} />
                </div>
                <h2 className="text-sm font-black uppercase tracking-widest text-primary">{t('insights.strategicPulse', 'Strategic Pulse')}</h2>
             </div>
             
             <div className="space-y-8">
                <div>
                   <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] font-black text-muted uppercase">{t('insights.resience', 'Portfolio Resilience')}</span>
                      <span className="text-xs font-black text-primary">85%</span>
                   </div>
                   <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: '85%' }} 
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                   </div>
                </div>

                <div>
                   <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] font-black text-muted uppercase">{t('insights.overhead', 'Capital Overhead')}</span>
                      <span className="text-xs font-black text-primary">22.4%</span>
                   </div>
                   <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: '22.4%' }} 
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        className="h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                   </div>
                </div>

                <div className="p-5 rounded-xl border border-border bg-background flex flex-col gap-3">
                   <div className="flex items-center gap-2">
                      <AlertCircle size={14} className="text-amber-500" />
                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{t('insights.advisory', 'Active Advisory')}</span>
                   </div>
                   <p className="text-[11px] leading-relaxed font-bold text-primary/70 italic pr-2 uppercase">
                      "{t('insights.advisoryText', 'Market volatility threshold exceeded in Consumer Discretionary sector. Re-balancing suggested.')}"
                   </p>
                </div>
             </div>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.03] group cursor-pointer"
               onClick={() => window.open('https://www.reuters.com/business/', '_blank')}>
             <div className="flex justify-between items-start mb-6">
                <Zap size={20} className="text-indigo-500" fill="currentColor" />
                <ExternalLink size={14} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
             <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-3">{t('insights.gateway', 'Institutional Gateway')}</h3>
             <p className="text-[10px] text-muted font-bold leading-relaxed uppercase opacity-60">
                {t('insights.gatewayDesc', 'Direct access to terminal-grade analytical engines and live liquidity streams from global sources.')}
             </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
