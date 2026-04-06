import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import PageLoader from '../Effects/PageLoader';
import ChatbotPanel from '../Chatbot/ChatbotPanel';
import { Toaster } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useStore } from '../../store';
import OnboardingGuide from '../Onboarding/OnboardingGuide';

export default function DashboardLayout() {
  const { isSidebarOpen, setSidebarOpen, toggleSidebar, onboarding, startOnboarding } = useStore();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 
  const location = useLocation();

  useEffect(() => {
    // Start onboarding on first visit
    if (!onboarding.seenOnboarding && !onboarding.isActive) {
      setTimeout(() => startOnboarding(), 2000);
    }
  }, [onboarding.seenOnboarding, onboarding.isActive, startOnboarding]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  useEffect(() => {
    setIsLoading(true);
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 1200); // Increased to 1200ms for a deliberate, premium experience
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-primary relative font-sans">
      <Toaster 
        position="top-center" 
        toastOptions={{
          className: 'bg-panel text-primary border border-border shadow-lg',
          style: {
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600'
          }
        }} 
      />
      
      <div className="flex-1 flex flex-row relative z-10 w-full overflow-hidden bg-background">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
      
        <div className="flex-1 flex flex-col relative overflow-hidden bg-background">
          <Topbar toggleSidebar={toggleSidebar} />
          
          <main className="flex-1 overflow-y-auto px-4 md:px-8 pt-6 pb-8 relative scroll-smooth bg-background">
            <AnimatePresence mode="wait">
              {isLoading && <PageLoader key="loader" />}
            </AnimatePresence>
            <div className={isLoading ? 'invisible' : 'visible'}>
               <Outlet />
            </div>
          </main>
        </div>
      </div>

      <ChatbotPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} onToggle={() => setIsChatOpen(!isChatOpen)} />
      <OnboardingGuide />
    </div>
  );
}
