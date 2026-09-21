import React from 'react';
import { Smartphone, Download, RefreshCw, Globe, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWAInstall';

interface AndroidAppBarProps {
  onOpenInstallModal: () => void;
  onSync: () => void;
  isSyncing: boolean;
  activeTestTitle?: string;
  onOpenBlogspot: () => void;
}

export const AndroidAppBar: React.FC<AndroidAppBarProps> = ({
  onOpenInstallModal,
  onSync,
  isSyncing,
  activeTestTitle,
  onOpenBlogspot,
}) => {
  const isOnline = useOnlineStatus();

  return (
    <header className="flex-shrink-0 bg-slate-900/95 border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between z-20 backdrop-blur-md">
      {/* Brand & Blog Info */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-600 to-blue-700 p-1.5 flex-shrink-0 flex items-center justify-center shadow-md border border-sky-400/30">
          <img src="/icon.svg" alt="App Logo" className="w-full h-full object-contain" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-bold text-white tracking-tight truncate">
              {activeTestTitle ? activeTestTitle : 'MJ JEE'}
            </h1>
            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
              Android
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
            <span>ranjan2045r.blogspot.com</span>
            {!isOnline && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-400 font-medium ml-1">
                <WifiOff className="w-3 h-3" /> Offline
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Quick Action Icons */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={onSync}
          disabled={isSyncing}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
          title="Sync latest tests from blog"
          aria-label="Sync"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-sky-400' : ''}`} />
        </button>

        <button
          onClick={onOpenBlogspot}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Visit ranjan2045r.blogspot.com"
          aria-label="Visit Blog"
        >
          <Globe className="w-4 h-4 text-sky-400" />
        </button>

        <button
          onClick={onOpenInstallModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-600/20 text-sky-300 border border-sky-500/30 hover:bg-sky-600/30 transition text-xs font-semibold"
          title="Install Android App"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install</span>
        </button>
      </div>
    </header>
  );
};
