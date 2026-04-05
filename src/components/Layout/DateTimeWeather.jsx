import { useEffect, useState } from 'react';

export default function DateTimeWeather({ className = "", vertical = false }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const formattedTime = currentTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  if (vertical) {
    return (
      <div className={`p-4 border-t border-border mt-auto bg-background/30 ${className}`}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-xl font-black text-primary tabular-nums tracking-tighter">{formattedTime}</span>
            </div>
            <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{formattedDate}</span>
          </div>
          
          <div className="h-px w-full bg-border/40" />
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-primary tracking-normal uppercase">Clear Sky</span>
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest leading-none mt-0.5">Optimal Node</span>
            </div>
            <div className="text-2xl font-black text-primary tracking-tighter">22°<span className="text-muted text-xs ml-0.5 font-bold">C</span></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 lg:gap-6 py-1.5 px-3 lg:px-6 bg-background/50 border border-border/40 rounded-xl shadow-inner ${className}`}>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 lg:gap-2">
          <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[9px] lg:text-[10px] font-black text-primary tabular-nums tracking-normal">{formattedTime}</span>
        </div>
        <span className="text-[7px] lg:text-[8px] font-bold text-muted uppercase tracking-wider">{formattedDate}</span>
      </div>
      
      <div className="w-px h-5 lg:h-6 bg-border" />
      
      <div className="flex items-center gap-2 lg:gap-3">
        <div className="flex flex-col items-end">
          <span className="text-[9px] lg:text-[10px] font-black text-primary tracking-normal uppercase">Clear Sky</span>
          <span className="text-[7px] lg:text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Optimal Node</span>
        </div>
        <div className="text-sm lg:text-xl font-black text-primary tracking-tighter">22°<span className="text-muted text-[8px] lg:text-[10px] ml-0.5">C</span></div>
      </div>
    </div>
  );
}
