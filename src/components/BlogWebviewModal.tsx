import React from 'react';
import { X, ExternalLink, Globe, RotateCw } from 'lucide-react';

interface BlogWebviewModalProps {
  url: string | null;
  onClose: () => void;
}

export const BlogWebviewModal: React.FC<BlogWebviewModalProps> = ({ url, onClose }) => {
  if (!url) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl h-[90vh] overflow-hidden rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col">
        {/* Android In-App Browser Header */}
        <div className="flex-shrink-0 bg-slate-950 px-3 py-2.5 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Globe className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <div className="min-w-0 flex-1 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono truncate">
              {url}
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Open in external browser"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close Webview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded Iframe */}
        <div className="flex-1 bg-white relative">
          <iframe
            src={url}
            title="Blogger Post"
            className="w-full h-full border-none"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        </div>
      </div>
    </div>
  );
};
