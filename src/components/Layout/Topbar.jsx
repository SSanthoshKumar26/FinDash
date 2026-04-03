import { Bell, Moon, Sun, Menu, Shield, Eye, EyeOff, Globe, Coins, ChevronDown, Check, Activity, Cpu, Mail, Lock, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ar', label: 'العربية' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'ru', label: 'Русский' }
];

const CURRENCIES = ['USD', 'INR', 'EUR'];
const ROLES = ['Admin', 'Viewer'];

const CustomDropdown = ({ icon: Icon, value, options, onChange, label, iconColor = "text-indigo-500" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-background/50 dark:bg-white/5 px-3 py-2 rounded-lg border border-border hover:border-primary/30 transition-all active:scale-95 min-w-[100px] justify-between"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <Icon size={14} className={iconColor} />
          <span className="text-xs font-black uppercase tracking-widest text-primary truncate">
             {typeof value === 'string' ? value : (options.find(o => o.code === value)?.label || value)}
          </span>
        </div>
        <ChevronDown size={12} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-48 bg-panel/90 backdrop-blur-2xl border border-border rounded-xl shadow-2xl z-[100] overflow-hidden max-h-64 overflow-y-auto custom-scrollbar shadow-indigo-500/10"
          >
            <div className="p-1.5 flex flex-col gap-1">
              {options.map((opt) => {
                const optVal = typeof opt === 'string' ? opt : opt.code;
                const optLabel = typeof opt === 'string' ? opt : opt.label;
                const isActive = value === optVal;
                
                return (
                  <button
                    key={optVal}
                    onClick={() => {
                      onChange(optVal);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${isActive ? 'bg-primary text-background' : 'text-primary hover:bg-primary/5 dark:hover:bg-white/5 hover:translate-x-1'}`}
                  >
                    <span>{optLabel}</span>
                    {isActive && <Check size={12} />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SignInModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success(t('auth.success', 'Operational Access Granted. Welcome back.'), {
        style: {
          background: 'var(--panel-color)',
          color: 'var(--primary-color)',
          border: '1px solid var(--border-color)',
          fontSize: '12px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }
      });
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className="relative w-full max-w-md bg-panel p-10 rounded-2xl shadow-2xl border border-border overflow-hidden"
          >
            {/* Professional Background Gradient */}
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-emerald-500" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center mb-4 border border-border shadow-sm">
                    <Cpu size={20} className="text-primary" />
                  </div>
                  <h2 className="text-xl font-black text-primary tracking-normal uppercase leading-tight">{t('auth.title', 'Terminal Access')}</h2>
                  <p className="text-muted text-[10px] font-bold uppercase tracking-wider mt-1 opacity-70">{t('auth.subtitle', 'Provide operational credentials')}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-muted hover:text-primary transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-muted-color">{t('auth.email', 'Email Address')}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@zorvyn.io"
                      className="w-full bg-background border border-border/50 rounded-xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:border-primary transition-all text-primary placeholder:opacity-30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-muted-color">{t('auth.password', 'Master Key')}</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-background border border-border/50 rounded-xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:border-primary transition-all text-primary placeholder:opacity-30"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-primary text-background py-4 rounded-xl text-[10px] font-black uppercase tracking-widest relative overflow-hidden group hover:opacity-90 active:scale-[0.98] transition-all shadow-lg"
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-2"
                      >
                         <Activity size={14} className="animate-spin text-background" />
                         <span>{t('auth.verifying', 'Verifying...')}</span>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="ready"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {t('auth.login', 'Authorize & Login')}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </form>

              <div className="flex items-center gap-4 mt-8 pt-8 border-t border-border/50">
                 <button className="flex-1 text-[9px] font-bold text-muted hover:text-primary uppercase tracking-widest transition-colors text-center">{t('auth.forgot', 'Forgot Key?')}</button>
                 <div className="w-px h-3 bg-border" />
                 <button className="flex-1 text-[9px] font-bold text-muted hover:text-primary uppercase tracking-widest transition-colors text-center">{t('auth.register', 'Establish Identity')}</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default function Topbar({ toggleSidebar }) {
  const { theme, toggleTheme, role, setRole, togglePrivacy, privacyMode, currency, setCurrency } = useStore();
  const { t, i18n } = useTranslation();
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const formattedTime = currentTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  return (
    <>
      <header className="h-16 border-b border-border bg-panel sticky top-0 z-[100] flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-6">
          <button className="md:hidden text-muted hover:text-primary transition-colors" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          
          {/* Professional Time, Date & Weather Display */}
          <div className="hidden lg:flex items-center gap-6 py-2 px-6 bg-background border border-border/60 rounded-xl shadow-inner">
             <div className="flex flex-col">
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                   <span className="text-[10px] font-black text-primary tabular-nums tracking-normal">{formattedTime}</span>
                </div>
                <span className="text-[8px] font-bold text-muted uppercase tracking-wider">{formattedDate}</span>
             </div>
             
             <div className="w-px h-6 bg-border" />
             
             <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                   <span className="text-[10px] font-black text-primary tracking-normal uppercase">Clear Sky</span>
                   <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Optimal Node</span>
                </div>
                <div className="text-xl font-black text-primary tracking-tighter">22°<span className="text-muted text-[10px] ml-0.5">C</span></div>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
          <CustomDropdown 
            icon={Globe} 
            value={i18n.language?.split('-')[0] || 'en'} 
            options={LANGUAGES} 
            onChange={(val) => i18n.changeLanguage(val)} 
            iconColor="text-indigo-400"
          />

          <div className="hidden lg:block">
            <CustomDropdown 
              icon={Coins} 
              value={currency} 
              options={CURRENCIES} 
              onChange={setCurrency} 
              iconColor="text-emerald-400"
            />
          </div>

          <CustomDropdown 
            icon={Shield} 
            value={role} 
            options={ROLES.map(r => ({ code: r, label: t(`roles.${r.toLowerCase()}`, r) }))} 
            onChange={setRole} 
            iconColor={role === 'Admin' ? 'text-indigo-400' : 'text-amber-400'}
          />

          <div className="w-px h-6 bg-border hidden sm:block"></div>

          <button onClick={togglePrivacy} className={`relative transition-colors p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-border ${privacyMode ? 'text-indigo-500' : 'text-muted hover:text-primary'}`}>
            {privacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>

          <button onClick={toggleTheme} className="relative text-muted hover:text-primary transition-colors p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-border">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button className="relative text-muted hover:text-primary transition-colors p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-border">
            <Bell size={18} />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse"></span>
          </button>
          
          <div className="w-px h-6 bg-border hidden sm:block"></div>
          
          <button 
            onClick={() => setIsSignInOpen(true)}
            className="flex items-center gap-3 cursor-pointer group bg-primary px-5 py-2.5 border border-primary hover:bg-slate-800 transition-all rounded-xl shadow-lg"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-background group-hover:text-white transition-colors">{t('topbar.signIn', 'Member Login')}</span>
          </button>
        </div>
      </header>

      <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
    </>
  );
}

