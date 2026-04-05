import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, LineChart, Lightbulb, Shield, ChevronLeft, ChevronRight, X, Target, Coins, Eye, EyeOff, Wallet } from 'lucide-react';
import { useStore } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import DateTimeWeather from './DateTimeWeather';
import CustomDropdown, { CURRENCIES, ROLES } from './CustomDropdown';

const navItems = [
  { key: 'dashboard', name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { key: 'planner', name: 'Intelligence Hub', path: '/planner', icon: Target },
  { key: 'transactions', name: 'Transactions', path: '/transactions', icon: Receipt },
  { key: 'analytics', name: 'Analytics', path: '/analytics', icon: LineChart },
  { key: 'insights', name: 'Insights', path: '/insights', icon: Lightbulb },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const { role, setRole, currency, setCurrency, togglePrivacy, privacyMode } = useStore();
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on mobile when navigating
  const handleNavClick = () => {
    if (isMobile) setIsOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[140] md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        animate={{ 
          width: isMobile ? 280 : (isOpen ? 256 : 80),
          x: isMobile ? (isOpen ? 0 : -280) : 0
        }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="h-screen bg-panel border-r border-border shrink-0 flex flex-col justify-between fixed md:relative z-[150]"
      >
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-border bg-panel">
            {(isOpen || isMobile) && (
              <span className="text-xl font-bold tracking-tight text-primary">
                {t('sidebar.brand', 'FinDash')}
              </span>
            )}
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-1 rounded-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-muted hover:text-primary"
            >
              {isMobile ? <X size={20} /> : (isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />)}
            </button>
          </div>
          
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.key}
                id={`sidebar-${item.key}`}
                to={item.path}
                onClick={handleNavClick}
                end={item.path === '/'}
                className={({ isActive }) => `
                  flex items-center gap-3 p-2.5 rounded-lg transition-all group
                  ${isActive ? 'bg-background text-primary border border-border shadow-sm' : 'text-muted hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'}
                `}
              >
                <item.icon size={18} className="shrink-0" />
                {(isOpen || isMobile) && <span className="font-semibold text-sm whitespace-nowrap">{t(`sidebar.${item.key}`, item.name)}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Mobile-only Quick Settings */}
        {isMobile && (
          <div className="mx-4 mb-4 p-4 rounded-xl border border-border/50 bg-background/30 space-y-3">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted mb-3">Quick Settings</p>

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Role</span>
              <CustomDropdown
                icon={Shield}
                value={role}
                options={ROLES.map(r => ({ code: r, label: t(`roles.${r.toLowerCase()}`, r) }))}
                onChange={setRole}
                iconColor={role === 'Admin' ? 'text-indigo-400' : 'text-amber-400'}
                align="right"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Currency</span>
              <CustomDropdown
                icon={Coins}
                value={currency}
                options={CURRENCIES}
                onChange={setCurrency}
                iconColor="text-emerald-400"
                align="right"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Privacy</span>
              <button
                onClick={togglePrivacy}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all ${
                  privacyMode
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                    : 'bg-background/50 border-border text-muted'
                }`}
              >
                {privacyMode ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>{privacyMode ? 'On' : 'Off'}</span>
              </button>
            </div>
          </div>
        )}

        {isMobile && <DateTimeWeather vertical className="mb-6" />}
      </motion.aside>
    </>
  );
}

