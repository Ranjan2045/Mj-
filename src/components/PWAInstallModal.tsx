import React from 'react';
import { Smartphone, Download, CheckCircle2, ShieldCheck, WifiOff, X, ExternalLink } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install, isAndroid, isIOS } = usePWAInstall();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100">
        {/* Header with Android branding */}
        <div className="relative bg-gradient-to-r from-sky-600 to-blue-700 p-5 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-1.5 text-white/80 hover:text-white hover:bg-white/10 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 p-2 flex items-center justify-center border border-white/20 shadow-inner">
              <img src="/icon.svg" alt="App Icon" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-semibold tracking-wide">
                <Smartphone className="w-3 h-3" /> Android App Edition
              </div>
              <h3 className="text-lg font-bold leading-tight mt-1">MJ JEE Mock Tests</h3>
              <p className="text-xs text-sky-100">ranjan2045r.blogspot.com</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Status Badge */}
          {isInstalled ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>App is currently installed and running on your device!</span>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-sky-950/60 border border-sky-800/40 text-xs text-sky-200 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
              <span>
                Install directly on your Android phone as a standalone application with offline mock tests, CBT exam simulator, and fast home screen access.
              </span>
            </div>
          )}

          {/* 1-Click Install Button if supported by browser */}
          {isInstallable && !isInstalled && (
            <button
              onClick={async () => {
                await install();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-sky-600/30 transition transform active:scale-95"
            >
              <Download className="w-5 h-5" />
              Install on Android Now
            </button>
          )}

          {/* Android Manual Steps */}
          <div className="rounded-xl bg-slate-800/60 p-4 border border-slate-700/60 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-sky-400" />
              How to install on Android (Chrome / Brave / Edge)
            </h4>
            <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside">
              <li>
                Open this app in <strong>Google Chrome</strong> on your Android phone.
              </li>
              <li>
                Tap the three dots menu <strong>(⋮)</strong> in the top right corner.
              </li>
              <li>
                Tap <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>.
              </li>
              <li>
                Confirm the prompt. The app icon will appear on your Android home screen and app drawer!
              </li>
            </ol>
          </div>

          {/* iOS instructions if user is on iOS */}
          {isIOS && (
            <div className="rounded-xl bg-slate-800/60 p-4 border border-slate-700/60 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Installation on iOS Safari
              </h4>
              <p className="text-xs text-slate-300">
                Tap the <strong>Share button</strong> in Safari, then select <strong>&ldquo;Add to Home Screen&rdquo;</strong>.
              </p>
            </div>
          )}

          {/* Highlights */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40 flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">100% Offline Practice</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-sky-400" />
              <span className="text-slate-300">Full Screen CBT</span>
            </div>
          </div>

          <div className="text-center pt-2">
            <a
              href="https://ranjan2045r.blogspot.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition"
            >
              <span>Visit original blog: ranjan2045r.blogspot.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
