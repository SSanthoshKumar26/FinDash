import { useState, useRef, useEffect, useMemo } from 'react';
import { X, Send, Cpu, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import Groq from 'groq-sdk';
import { useTranslation } from 'react-i18next';

const groq = new Groq({ 
  apiKey: import.meta.env.VITE_GROQ_API_KEY, 
  dangerouslyAllowBrowser: true 
});

export default function ChatbotPanel({ isOpen, onClose, onToggle }) {
  const { chatMessages, addChatMessage, transactions, currency, role } = useStore();
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [chatMessages, isTyping, isOpen]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + (prev.length > 0 ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListen = (e) => {
    e.preventDefault();
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const speak = (text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => v.lang.includes('en-US')) || voices[0];
    if (premiumVoice) utterance.voice = premiumVoice;
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };
  
  // Calculate real-time financial context for the AI
  const financialContext = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const balance = totalIncome - totalExpenses;
    const categories = transactions.reduce((acc, t) => {
      if (t.type === 'expense') {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      }
      return acc;
    }, {});
    
    return {
      totalIncome: totalIncome.toFixed(2),
      totalExpenses: totalExpenses.toFixed(2),
      balance: balance.toFixed(2),
      currency,
      role,
      recentTransactions: transactions.slice(0, 5).map(t => `${t.date}: ${t.name} (${t.amount} ${currency})`).join(', '),
      topCategories: Object.entries(categories).sort(([,a], [,b]) => b - a).slice(0, 3).map(([name, val]) => `${name}: ${val.toFixed(2)}`).join(', ')
    };
  }, [transactions, currency, role]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    window.speechSynthesis?.cancel(); 

    const userText = input.trim();
    const userMsg = { id: Date.now(), text: userText, sender: 'user' };
    addChatMessage(userMsg);
    setInput('');
    setIsTyping(true);

    const systemPrompt = `You are FinAI Oracle, a elite financial assistant. 
    You have SECURE ACCESS to the user's real-time financial data:
    - User Role: ${financialContext.role}
    - Active Currency: ${financialContext.currency}
    - Total Inflow (Income): ${financialContext.totalIncome}
    - Total Outflow (Expenses): ${financialContext.totalExpenses}
    - Net Liquid Balance: ${financialContext.balance}
    - Recent Activity: ${financialContext.recentTransactions}
    - Top Expense Sectors: ${financialContext.topCategories}
    
    CRITICAL RULES:
    1. Discuss the user's data naturally when asked. 
    2. Be concise (MAX 2 sentences). 
    3. Maintain an executive, professional tone. 
    4. Speak as if you are directly observing their dashboard.`;

    try {
      const response = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          ...chatMessages.map(m => ({ role: m.sender === 'bot' ? 'assistant' : 'user', content: m.text })),
          { role: 'user', content: userText }
        ],
        model: 'llama-3.3-70b-versatile'
      });
      
      const botText = response.choices[0]?.message?.content || "I couldn't process that request at this time.";
      const botMsg = { id: Date.now() + 1, text: botText, sender: 'bot' };
      addChatMessage(botMsg);
      speak(botText);

    } catch (error) {
      console.error(error);
      const errorMsg = t('chat.serviceUnavailable', "Service unavailable. Please verify API key or network connection.");
      addChatMessage({ id: Date.now() + 1, text: errorMsg, sender: 'bot' });
      speak(errorMsg);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-4 sm:right-6 bottom-24 top-24 w-80 md:w-96 glass-panel z-50 flex flex-col rounded-2xl shadow-2xl border border-border overflow-hidden bg-panel"
          >
            <div className="flex items-center justify-between p-4 border-b border-border relative overflow-hidden bg-background">
              <div className="flex items-center gap-3 relative z-10">
                <div className="bg-primary text-background p-2 rounded-xl shadow-sm">
                  <Cpu size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-primary tracking-tight">{t('chat.aiTitle', 'FinAI Oracle')}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    <span className="text-[10px] text-muted font-semibold tracking-widest uppercase">{t('chat.status', 'Connected')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => {
                  setVoiceEnabled(!voiceEnabled);
                  if (voiceEnabled) window.speechSynthesis?.cancel();
                }} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors text-muted hover:text-primary">
                  {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button onClick={onClose} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors relative z-10 text-muted hover:text-primary leading-none flex items-center justify-center">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-panel">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3.5 text-sm leading-relaxed shadow-sm tracking-wide border ${
                    msg.sender === 'user' 
                      ? 'bg-background text-primary border-border rounded-2xl rounded-br-sm font-medium' 
                      : 'bg-primary text-background border-primary rounded-2xl rounded-bl-sm font-medium'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-background border border-border text-primary rounded-2xl rounded-bl-sm p-4 w-16 flex items-center justify-center gap-1.5 shadow-sm">
                    <motion.div className="w-1.5 h-1.5 bg-muted rounded-full" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 bg-muted rounded-full" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 bg-muted rounded-full" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-border bg-background">
              <div className="relative flex items-center gap-2">
                <button 
                  type="button"
                  onClick={toggleListen}
                  className={`p-2 transition-colors rounded-xl border ${isListening ? 'border-rose-500/50 bg-rose-500/10 text-rose-500 animate-pulse' : 'border-border bg-panel text-muted hover:text-primary'}`}
                >
                  {isListening ? <Mic size={16} /> : <MicOff size={16} />}
                </button>
                <div className="relative flex-1 group">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isListening ? t('chat.listening', "Listening...") : t('chat.placeholder', "Ask FinAI...")}
                    className="w-full bg-panel border border-border rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-primary text-primary transition-all shadow-inner placeholder:text-muted"
                  />
                  <button 
                    type="submit" 
                    disabled={!input.trim()}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-2 bg-primary text-background rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <Send size={14} className="ml-0.5" />
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          onClick={onToggle}
          className="fixed right-6 bottom-6 z-50 p-4 bg-primary text-background rounded-full shadow-xl hover:opacity-90 transition-all cursor-pointer flex items-center gap-2 group border border-transparent dark:border-white/10"
        >
          <Cpu size={20} className="text-background" />
          <span className="text-sm font-bold tracking-widest uppercase pr-1">{t('chat.askAi', 'Ask AI')}</span>
        </motion.button>
      )}
    </>
  );
}
