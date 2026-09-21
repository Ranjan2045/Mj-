import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, Smartphone, Maximize2, Minimize2 } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  isFrameEnabled: boolean;
  onToggleFrame: () => void;
  appName?: string;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isFrameEnabled,
  onToggleFrame,
}) => {
  const [timeStr, setTimeStr] = useState('10:14');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isFrameEnabled) {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-0 sm:p-4 md:p-6 lg:p-8 font-sans">
      {/* Control bar for Desktop Users */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-[420px] mb-3 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-medium text-slate-300">
          <Smartphone className="w-4 h-4 text-sky-400" />
          <span>Android App Preview Mode</span>
        </div>
        <button
          onClick={onToggleFrame}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700/60"
          title="Switch to full screen layout"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Expand to Full Width</span>
        </button>
      </div>

      {/* Android Device Shell */}
      <div className="relative w-full sm:max-w-[420px] sm:h-[880px] h-screen bg-slate-900 sm:rounded-[44px] shadow-2xl sm:border-[9px] sm:border-slate-800 flex flex-col overflow-hidden ring-1 ring-slate-700/50">
        
        {/* Android Punch Hole Camera & Speaker (Desktop Only) */}
        <div className="hidden sm:block absolute top-3 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="w-4 h-4 rounded-full bg-black ring-2 ring-slate-800/80 shadow-inner flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-950/80" />
          </div>
        </div>

        {/* Android Status Bar */}
        <div className="flex-shrink-0 h-8 px-5 pt-1.5 flex items-center justify-between bg-slate-950 text-slate-300 text-xs font-semibold z-30 select-none">
          <span className="text-[12px] font-medium tracking-tight text-slate-200">{timeStr}</span>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-[10px] font-bold text-sky-400">5G</span>
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-[11px] font-normal">98%</span>
              <BatteryMedium className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden bg-slate-950">
          {children}
        </div>

        {/* Android Gesture Navigation Bar Pill */}
        <div className="flex-shrink-0 h-5 bg-slate-950 flex items-center justify-center pointer-events-none z-30">
          <div className="w-32 h-1 bg-slate-600 rounded-full opacity-60" />
        </div>
      </div>
    </div>
  );
};
