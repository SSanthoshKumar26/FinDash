import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export const LANGUAGES = [
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

export const CURRENCIES = ['USD', 'INR', 'EUR'];
export const ROLES = ['Admin', 'Viewer'];

export default function CustomDropdown({ icon: Icon, value, options, onChange, label, iconColor = "text-indigo-500", align = "right" }) {
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
      {/* Mobile: icon-only pill */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex sm:hidden items-center justify-center bg-background/50 dark:bg-white/5 w-9 h-9 rounded-lg border border-border hover:border-primary/30 transition-all active:scale-95"
      >
        <Icon size={15} className={iconColor} />
      </button>

      {/* sm+: icon + label + chevron */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="hidden sm:flex items-center gap-2 bg-background/50 dark:bg-white/5 px-3 py-2 rounded-lg border border-border hover:border-primary/30 transition-all active:scale-95 min-w-[100px] justify-between"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <Icon size={14} className={iconColor} />
          <span className="text-xs font-black uppercase tracking-widest text-primary truncate">
             {typeof value === 'string' ? value : (options.find(o => o.code === value)?.label || value)}
          </span>
        </div>
        <ChevronDown size={12} className={`transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-2 w-48 bg-panel/90 backdrop-blur-2xl border border-border rounded-xl shadow-2xl z-[100] overflow-hidden max-h-64 overflow-y-auto custom-scrollbar shadow-indigo-500/10`}
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
}
