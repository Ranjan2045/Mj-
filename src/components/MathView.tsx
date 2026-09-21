import React, { useEffect, useRef } from 'react';
import { cleanLatexText } from '../data/mockTestsService';

interface MathViewProps {
  content: string;
  className?: string;
  diagramSvg?: string;
}

declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: (elements?: HTMLElement[]) => Promise<void>;
      typesetClear?: (elements?: HTMLElement[]) => void;
    };
  }
}

export const MathView: React.FC<MathViewProps> = ({ content, className = '', diagramSvg }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const cleaned = cleanLatexText(content);

  useEffect(() => {
    let isMounted = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const runMathJax = () => {
      if (!isMounted || !containerRef.current) return;
      if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
        try {
          if (window.MathJax.typesetClear) {
            window.MathJax.typesetClear([containerRef.current]);
          }
          window.MathJax.typesetPromise([containerRef.current]).catch((err) => {
            console.debug('MathJax typesetting error:', err);
          });
        } catch (e) {
          console.debug('MathJax execution error:', e);
        }
      } else {
        // Retry shortly if MathJax CDN script is still initializing
        timer = setTimeout(runMathJax, 200);
      }
    };

    runMathJax();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [cleaned, diagramSvg]);

  return (
    <div className={`leading-relaxed ${className}`}>
      <div ref={containerRef} className="space-y-3">
        <div
          className="mathjax-content break-words"
          dangerouslySetInnerHTML={{ __html: cleaned }}
        />

        {diagramSvg && (
          <div
            className="my-3 flex justify-center overflow-x-auto rounded-xl bg-white p-3 border border-slate-700 shadow-md"
            dangerouslySetInnerHTML={{ __html: diagramSvg }}
          />
        )}
      </div>
    </div>
  );
};

