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

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start as true for initial mount
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
        <div className="flex-1 flex flex-col relative overflow-hidden bg-background">
          <Topbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          
          <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 relative scroll-smooth bg-background">
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
    </div>
  );
}
