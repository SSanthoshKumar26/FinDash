import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, LineChart, Lightbulb, MessageSquare, Shield, ChevronLeft, ChevronRight, X, Target } from 'lucide-react';
import { useStore } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const navItems = [
  { key: 'dashboard', name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { key: 'planner', name: 'Planner', path: '/planner', icon: Target },
  { key: 'transactions', name: 'Transactions', path: '/transactions', icon: Receipt },
  { key: 'analytics', name: 'Analytics', path: '/analytics', icon: LineChart },
  { key: 'insights', name: 'Insights', path: '/insights', icon: Lightbulb },
  { key: 'protocols', name: 'Protocols', path: '/protocols', icon: Shield },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const { role, setRole } = useStore();
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
      </motion.aside>
    </>
  );
}

