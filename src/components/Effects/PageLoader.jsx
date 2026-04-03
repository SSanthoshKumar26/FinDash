import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

export default function PageLoader() {
  return (
    <motion.div 
      initial={{ opacity: 1 }} // Start fully opaque to prevent content flash
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-background" // Solid background initially
    >
      <div className="relative flex flex-col items-center">
         {/* Premium Scanner Circle */}
         <div className="relative w-24 h-24 mb-10 flex items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-[2px] border-border/20 border-t-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]" />
            <motion.div 
              animate={{ rotate: -360 }} 
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-4 rounded-full border-[2px] border-border/20 border-b-emerald-500" />
            <Activity className="text-indigo-500 w-10 h-10 animate-pulse" />
         </div>

         {/* modern progress indicator */}
         <div className="w-[180px] h-1 bg-border/20 rounded-full overflow-hidden relative mb-4">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-indigo-500" />
         </div>

         <div className="flex flex-col items-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2 italic">Syncing Capital Data</p>
            <div className="flex gap-1">
               {[...Array(3)].map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1 h-1 bg-emerald-500 rounded-full" />
               ))}
            </div>
         </div>
      </div>
      
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full -z-10" />
    </motion.div>
  );
}
