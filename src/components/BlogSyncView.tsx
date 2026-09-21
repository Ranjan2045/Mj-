import React, { useState } from 'react';
import {
  Globe,
  RefreshCw,
  ExternalLink,
  Download,
  Smartphone,
  CheckCircle,
  Database,
  Sparkles,
  Info,
  Sliders,
  Check,
  Share2,
} from 'lucide-react';
import { AppSettings, MockTest } from '../types';

interface BlogSyncViewProps {
  tests: MockTest[];
  isSyncing: boolean;
  onSync: () => void;
  syncMessage: string | null;
  onOpenInstallModal: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const BlogSyncView: React.FC<BlogSyncViewProps> = ({
  tests,
  isSyncing,
  onSync,
  syncMessage,
  onOpenInstallModal,
  settings,
  onUpdateSettings,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShareApp = async () => {
    const shareData = {
      title: 'MJ JEE Mock Tests - Android App',
      text: 'Practice full syllabus JEE Main mock tests offline with CBT exam simulator from ranjan2045r.blogspot.com',
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.debug('Share cancelled or failed', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
      {/* Blog Identity Card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-sky-950/40 to-slate-900 border border-sky-800/40 p-5 space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-600/20 border border-sky-500/30 p-2 flex items-center justify-center flex-shrink-0">
            <img src="/icon.svg" alt="App Icon" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/25 text-sky-300 border border-sky-500/30">
              ranjan2045r.blogspot.com
            </span>
            <h3 className="text-base font-bold text-white mt-1">MJ JEE Mock Tests</h3>
            <p className="text-xs text-slate-400">By Ankit Kumar (ranjan2045r@gmail.com)</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          This Android application is directly integrated with the blog <strong>ranjan2045r.blogspot.com</strong>. It packages full mock test papers for Physics, Chemistry, and Mathematics into a mobile-first, installable application with offline CBT simulator.
        </p>

        {/* Live Sync Action */}
        <div className="pt-1">
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-950/50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing with Blog...' : 'Check & Sync Latest Tests from Blog'}</span>
          </button>

          {syncMessage && (
            <div className="mt-2 text-center text-xs p-2 rounded-lg bg-sky-950/80 text-sky-200 border border-sky-800/60">
              {syncMessage}
            </div>
          )}
        </div>

        {/* Action Links */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <a
            href="https://ranjan2045r.blogspot.com"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs text-sky-400 flex items-center justify-center gap-1.5 transition"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Open Blogspot</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={handleShareApp}
            className="py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-300 flex items-center justify-center gap-1.5 transition"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-400" />
            <span>{copiedLink ? 'Link Copied!' : 'Share App'}</span>
          </button>
        </div>
      </div>

      {/* Android Installation Card */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-sky-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Android Installation
            </h4>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
            PWA / WebAPK Ready
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Install on Android for a full-screen app experience without browser URL bars, with home screen launch icon and 100% offline study capability.
        </p>

        <button
          onClick={onOpenInstallModal}
          className="w-full py-2.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition"
        >
          <Download className="w-4 h-4" />
          <span>View Android Install Steps</span>
        </button>
      </div>

      {/* Offline Storage & Diagnostics */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Offline Storage Diagnostics</span>
        </div>

        <div className="space-y-1.5 text-xs text-slate-400">
          <div className="flex justify-between py-1 border-b border-slate-800">
            <span>Bundled Mock Tests:</span>
            <strong className="text-white font-mono">{tests.length} Full Tests</strong>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800">
            <span>Total Questions Cached:</span>
            <strong className="text-white font-mono">
              {tests.reduce((acc, t) => acc + t.totalQuestions, 0)} Questions
            </strong>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800">
            <span>Target Syllabus:</span>
            <strong className="text-white font-mono">JEE Main (PCM)</strong>
          </div>
          <div className="flex justify-between py-1">
            <span>Service Worker:</span>
            <strong className="text-emerald-400 font-mono">Active (Cache-First)</strong>
          </div>
        </div>
      </div>

      {/* App Preferences */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200">
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>App Preferences</span>
        </div>

        <div className="space-y-2 text-xs">
          <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer">
            <span className="text-slate-300">Android Device Frame (Desktop preview)</span>
            <input
              type="checkbox"
              checked={settings.deviceFrame}
              onChange={(e) => onUpdateSettings({ deviceFrame: e.target.checked })}
              className="w-4 h-4 accent-sky-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer">
            <span className="text-slate-300">Auto-save responses locally</span>
            <input
              type="checkbox"
              checked={settings.autoSaveResponses}
              onChange={(e) => onUpdateSettings({ autoSaveResponses: e.target.checked })}
              className="w-4 h-4 accent-sky-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer">
            <span className="text-slate-300">Haptic feedback on tap</span>
            <input
              type="checkbox"
              checked={settings.vibration}
              onChange={(e) => onUpdateSettings({ vibration: e.target.checked })}
              className="w-4 h-4 accent-sky-500 rounded"
            />
          </label>
        </div>
      </div>

      {/* About & Copyright */}
      <div className="text-center space-y-1 text-[11px] text-slate-500 pt-2">
        <div>MJ JEE Mock Tests v1.0.0</div>
        <div>Content source: <a href="https://ranjan2045r.blogspot.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">ranjan2045r.blogspot.com</a></div>
      </div>
    </div>
  );
};
