import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { Bot, X, ChevronRight, ChevronLeft, Play, SkipForward } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const ONBOARDING_STEPS = [
  {
    target: null,
    title: 'Welcome to Zorvyn',
    text: "Hi 👋 I’ll walk you through how your financial dashboard is structured. This will help you understand where everything lives and how to use it effectively.",
    nextText: "Start Tour",
    position: 'center'
  },
  {
    target: '#sidebar-dashboard',
    title: 'Command Center',
    text: "This is your Dashboard, where you get a quick overview of your financial status. It brings together key metrics, summaries, and visual insights so you can instantly understand your current position without digging into details.",
    nextText: "Next Module",
    position: 'right'
  },
  {
    target: '#sidebar-planner',
    title: 'Financial Intelligence',
    text: "This is your Financial Intelligence Hub, the core of your system. Here, you manage your income and expenses, and the system analyzes your data in real time to give you a clear picture of your spending, savings, and overall financial health.",
    nextText: "View Transactions",
    position: 'right'
  },
  {
    target: '#sidebar-transactions',
    title: 'Universal Ledger',
    text: "In Transactions, you can view and manage all your financial activity. This section helps you track where your money is going over time and gives you a detailed history of your spending patterns.",
    nextText: "Check Analytics",
    position: 'right'
  },
  {
    target: '#sidebar-analytics',
    title: 'Quants & Trends',
    text: "The Analytics section provides deeper insights into your financial data. Here, you can explore trends, patterns, and visual reports that help you understand your behavior and make better financial decisions.",
    nextText: "Review Insights",
    position: 'right'
  },
  {
    target: '#sidebar-insights',
    title: 'AI Recommendations',
    text: "In Insights, you’ll find smart recommendations generated from your data. These suggestions help you optimize your spending, improve savings, and make more informed financial choices.",
    nextText: "Finish Tour",
    position: 'right'
  },
  {
    target: null,
    title: 'System Initialized',
    text: "You are now fully synchronized. Feel free to explore each section — I'm available in the Chatbot if you require further technical intelligence.",
    nextText: "Complete",
    position: 'center'
  }
];

export default function OnboardingGuide() {
  const { onboarding, nextOnboardingStep, prevOnboardingStep, skipOnboarding, completeOnboarding, setSidebarOpen } = useStore();
  const [targetRect, setTargetRect] = useState(null);
  const [typingText, setTypingText] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const currentStepData = ONBOARDING_STEPS[onboarding.currentStep];

  // Typing animation
  useEffect(() => {
    if (!onboarding.isActive || !currentStepData) return;
    
    let index = 0;
    setTypingText('');
    const timer = setInterval(() => {
      setTypingText(currentStepData.text.substring(0, index));
      index++;
      if (index > currentStepData.text.length) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [onboarding.currentStep, onboarding.isActive, currentStepData]);

  // Spotlight logic
  const updateSpotlight = useCallback(() => {
    if (!onboarding.isActive || !currentStepData || !currentStepData.target) {
        setTargetRect(null);
        return;
    }

    // Always ensure sidebar is open when targeting sidebar items
    if (currentStepData.target.startsWith('#sidebar')) {
        setSidebarOpen(true);
    }

    // Small delay to allow sidebar animation to finish before calculating rect
    setTimeout(() => {
      const el = document.querySelector(currentStepData.target);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  }, [onboarding.isActive, currentStepData, setSidebarOpen]);

  useEffect(() => {
    updateSpotlight();
    window.addEventListener('resize', updateSpotlight);
    const interval = setInterval(updateSpotlight, 1000); // Periodic check to handle layout shifts
    return () => {
        window.removeEventListener('resize', updateSpotlight);
        clearInterval(interval);
    };
  }, [updateSpotlight]);

  if (!onboarding.isActive) return null;

  const handleNext = () => {
    if (onboarding.currentStep === ONBOARDING_STEPS.length - 1) {
        completeOnboarding();
    } else {
        nextOnboardingStep();
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] pointer-events-none overflow-hidden">
      {/* Dimmed Overlay with Spotlight */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 pointer-events-auto"
        style={{
            maskImage: targetRect ? `radial-gradient(circle at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px, transparent ${Math.max(targetRect.width, targetRect.height) / 1.5}px, black ${Math.max(targetRect.width, targetRect.height) / 1.2}px)` : 'none',
            WebkitMaskImage: targetRect ? `radial-gradient(circle at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px, transparent ${Math.max(targetRect.width, targetRect.height) / 1.5}px, black ${Math.max(targetRect.width, targetRect.height) / 1.2}px)` : 'none',
        }}
      />

      {/* Spotlight Border */}
      {targetRect && (
        <motion.div 
          layoutId="spotlight"
          className="absolute border-2 border-primary rounded-xl"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            boxShadow: '0 0 40px rgba(99, 102, 241, 0.4)'
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 150 }}
        />
      )}

      {/* AI Assistant Bubble */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className={`absolute pointer-events-auto max-w-sm w-full bg-panel border-2 border-primary/20 rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col ${
            !targetRect ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''
          }`}
          style={targetRect ? (window.innerWidth < 768 ? {
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: '400px'
          } : {
            top: currentStepData.position === 'top' ? targetRect.top - 200 : (currentStepData.position === 'bottom' ? targetRect.top + targetRect.height + 20 : '50%'),
            left: currentStepData.position === 'right' ? targetRect.left + targetRect.width + 20 : (targetRect.left + targetRect.width / 2 - 192),
            transform: currentStepData.position === 'right' ? 'translateY(-50%)' : 'none'
          }) : {}}
        >
          <div className="bg-primary/10 border-b border-primary/10 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                <Bot size={20} className="text-background" />
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">{currentStepData.title}</h4>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[8px] font-black text-muted uppercase tracking-[0.2em] leading-none">SYSTEM.GUIDE_ON</span>
                </div>
              </div>
            </div>
            <button 
              onClick={skipOnboarding}
              className="p-2 text-muted hover:text-rose-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-6">
            <p className="text-xs font-bold text-primary/80 leading-relaxed min-h-[60px] tracking-wide font-sans">
              {typingText}
              <motion.span 
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-1 h-3 bg-primary ml-1 align-middle"
              />
            </p>
          </div>

          <div className="bg-black/20 p-4 flex items-center justify-between gap-4 border-t border-white/5">
            <button 
              onClick={skipOnboarding}
              className="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-muted hover:text-primary transition-all flex items-center gap-2"
            >
              <SkipForward size={10} /> Skip
            </button>
            <div className="flex items-center gap-2">
              {onboarding.currentStep > 0 && (
                <button 
                  onClick={prevOnboardingStep}
                  className="p-2 border border-white/10 rounded-lg text-muted hover:text-primary transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
              )}
              <button 
                onClick={handleNext}
                className="px-6 py-2.5 bg-primary text-background rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {currentStepData.nextText} <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto">
        {ONBOARDING_STEPS.map((_, i) => (
          <div 
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${i === onboarding.currentStep ? 'w-8 bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'w-2 bg-white/20'}`}
          />
        ))}
      </div>
    </div>
  );
}
