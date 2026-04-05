import { useState, useRef, useEffect, useMemo } from 'react';
import { X, Send, Cpu, Mic, MicOff, Trash2, History, Plus, MessageSquare, Trash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import Groq from 'groq-sdk';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const groq = new Groq({ 
  apiKey: import.meta.env.VITE_GROQ_API_KEY, 
  dangerouslyAllowBrowser: true 
});

export default function ChatbotPanel({ isOpen, onClose, onToggle }) {
  const { 
    conversations, 
    currentConversationId, 
    setCurrentConversation, 
    addChatMessage, 
    clearChat, 
    createNewChat,
    deleteChat,
    transactions, 
    currency, 
    role 
  } = useStore();
  
  const { t } = useTranslation();
  const location = useLocation();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  const currentChat = useMemo(() => 
    conversations.find(c => c.id === currentConversationId) || conversations[0]
  , [conversations, currentConversationId]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [currentChat.messages, isTyping, isOpen]);

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

    const userText = input.trim();
    const userMsg = { id: Date.now(), text: userText, sender: 'user' };
    addChatMessage(userMsg);
    setInput('');
    setIsTyping(true);

    const systemPrompt = `You are FinDash AI, the intelligent assistant for the Zorvyn Financial Dashboard. 
    
    STRICT RESPONSE STRUCTURE (MANDATORY):
    1. **Title**: Clear heading for the topic.
    2. **Summary**: Max 2-3 lines explaining the core concept.
    3. **Structural Breakdown**: Detailed bullet points for data, features, or metrics. Use **Bold Labels** for all numbers and categories.
    4. **Analytical Insights**: Direct, meaningful analysis of the user's data (e.g., "Positive cash flow vector detected").
    5. **Strategic Recommendations**: Actionable steps for financial optimization.

    STYLE GUIDELINES:
    - ZERO long paragraphs. Break information into readable blocks.
    - NO generic filler text or introductory fluff ("I hope this helps").
    - Professional, confident, and technical tone.
    - Use spacing and markdown headers (--- or Bold) for premium visual structure.

    CORE KNOWLEDGE & CONTEXT:
    - Current Page: User is viewing the ${location.pathname} section.
    - Dashboard: High-level overview of revenue vs expenses.
    - Planner: Core engine for Burn Rate (spending velocity), Surplus (liquid buffer), and Savings Rate calculations.
    - Transactions: Universal Ledger for historical vector analysis.
    - Analytics: Forecasting Hub for trend synchronization.

    USER DATA OVERLAY:
    - Balance: ${financialContext.balance} ${financialContext.currency}
    - Income: ${financialContext.totalIncome} ${financialContext.currency}
    - Recent Vectors: ${financialContext.recentTransactions}
    - Spending Concentration: ${financialContext.topCategories}

    GOAL:
    Deliver instant value through structured intelligence. If asked for a definition (e.g., "What is burn rate?"), provide a structured breakdown of the metric and its impact.`;

    try {
      const response = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          ...currentChat.messages.slice(-10).map(m => ({ role: m.sender === 'bot' ? 'assistant' : 'user', content: m.text })),
          { role: 'user', content: userText }
        ],
        model: 'llama-3.3-70b-versatile'
      });
      
      const botText = response.choices[0]?.message?.content || "I couldn't process that request.";
      const botMsg = { id: Date.now() + 1, text: botText, sender: 'bot' };
      addChatMessage(botMsg);

    } catch (error) {
      console.error(error);
      const errorMsg = t('chat.serviceUnavailable', "Service unavailable.");
      addChatMessage({ id: Date.now() + 1, text: errorMsg, sender: 'bot' });
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
            className="fixed right-4 sm:right-6 bottom-24 top-20 w-80 md:w-[420px] glass-panel z-50 flex flex-col rounded-2xl shadow-2xl border border-border overflow-hidden bg-panel"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-background relative z-20">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className={`p-2 rounded-xl transition-colors ${showHistory ? 'bg-primary text-background' : 'hover:bg-panel text-muted'}`}
                >
                  <History size={18} />
                </button>
                <div>
                  <h3 className="font-bold text-sm text-primary tracking-tight truncate max-w-[150px]">
                    Intelligence Assistant
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] text-muted font-semibold uppercase tracking-widest">FinDash AI v1.0</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button 
                  title="New Chat"
                  onClick={() => { createNewChat(); setShowHistory(false); }}
                  className="p-2 hover:bg-panel rounded-xl text-muted hover:text-primary transition-all"
                >
                  <Plus size={18} />
                </button>
                <button 
                  title="Clear Current Chat"
                  onClick={() => clearChat()} 
                  className="p-2 hover:bg-rose-500/10 rounded-xl text-muted hover:text-rose-500 transition-all"
                >
                  <Trash2 size={18} />
                </button>
                <button onClick={onClose} className="p-2 hover:bg-panel rounded-xl text-muted hover:text-primary transition-all">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 relative flex overflow-hidden">
              {/* History Sidebar/Overlay */}
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ x: -300 }}
                    animate={{ x: 0 }}
                    exit={{ x: -300 }}
                    className="absolute inset-y-0 left-0 w-64 bg-background border-r border-border z-30 shadow-xl p-4 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-muted uppercase tracking-widest">History</span>
                      <button onClick={() => createNewChat()} className="p-1 px-2 text-[10px] bg-primary/10 text-primary rounded-lg border border-primary/20 hover:bg-primary/20 transition-all flex items-center gap-1">
                        <Plus size={10} /> {t('chat.new', 'New')}
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {conversations.map((conv) => (
                        <div 
                          key={conv.id}
                          className={`group flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all border ${
                            conv.id === currentConversationId 
                              ? 'bg-primary/10 border-primary/30 text-primary' 
                              : 'hover:bg-panel border-transparent text-muted'
                          }`}
                          onClick={() => {
                            setCurrentConversation(conv.id);
                            setShowHistory(false);
                          }}
                        >
                          <MessageSquare size={14} className="flex-shrink-0" />
                          <span className="text-xs font-medium truncate flex-1">{conv.title}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChat(conv.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500 transition-all"
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col bg-panel/30">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {currentChat.messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[90%] p-4 text-sm leading-relaxed shadow-lg tracking-wide border ${
                        msg.sender === 'user' 
                          ? 'bg-background text-primary border-border rounded-2xl rounded-br-none font-medium' 
                          : 'bg-primary text-background border-primary rounded-2xl rounded-bl-none font-medium shadow-primary/20'
                      }`}>
                        <div className={`markdown-content ${msg.sender === 'bot' ? 'bot-message' : 'user-message'}`}>
                          <ReactMarkdown 
                            components={{
                              p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-3 space-y-1" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-3 space-y-1" {...props} />,
                              li: ({node, ...props}) => <li className="pl-1" {...props} />,
                              h1: ({node, ...props}) => <h1 className="text-base font-black uppercase tracking-widest mb-3" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-sm font-black uppercase tracking-widest mb-2" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-xs font-black uppercase tracking-wider mb-2" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-black" {...props} />,
                              hr: () => <hr className="my-4 border-current opacity-10" />
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-background border border-border text-primary rounded-2xl rounded-bl-sm p-4 w-16 flex items-center justify-center gap-1.5 shadow-sm">
                        <motion.div className="w-1.5 h-1.5 bg-muted rounded-full" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4 }} />
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
                      className={`p-2 transition-colors rounded-xl border ${isListening ? 'border-rose-500/50 bg-rose-500/10 text-rose-500 animate-pulse' : 'border-border bg-panel text-muted'}`}
                    >
                      {isListening ? <Mic size={18} /> : <MicOff size={18} />}
                    </button>
                    <div className="relative flex-1 group">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isListening ? "Listening..." : "Ask FinDash AI..."}
                        className="w-full bg-panel border border-border rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-primary text-primary transition-all shadow-inner placeholder:text-muted"
                      />
                      <button 
                        type="submit" 
                        disabled={!input.trim()}
                        className="absolute right-2 top-2 bottom-2 px-3 bg-primary text-background rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
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
          <Cpu size={24} className="text-background" />
          <span className="text-sm font-bold tracking-widest uppercase pr-1">FinDash AI</span>
        </motion.button>
      )}
    </>
  );
}

